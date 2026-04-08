const express = require('express');
const cors = require('cors');
const Razorpay = require('razorpay');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Link = require('./models/Link');
const Admin = require('./models/Admin');
const Settings = require('./models/Settings');

const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'arcpay_super_secret_key_2024';

// Database Connection
const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/arcpay';
const dbHost = dbUri.split('@')[1] || 'localhost';

console.log(`Connecting to Secure Node: [${dbHost.split(':')[0]}]...`);

mongoose.connect(dbUri, {
  serverSelectionTimeoutMS: 10000 // 10-second timeout to prevent hangs
})
  .then(async () => {
    console.log('ArcPay Database - CONNECTED');
    // Initialize default global settings if they don't exist
    const settings = await Settings.findOne();
    if (!settings) {
      await Settings.create({});
      console.log('Global Settings - INITIALIZED');
    }
  })
  .catch(err => {
    console.error('Database Connection Error - FAILED');
    console.error(`Error Details: ${err.message}`);
    console.error('CRITICAL: Check if your local IP is whitelisted in Railway Dashboard > MongoDB > Settings > Public Networking.');
  });

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['https://pay.arcbyte.co', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true
}));

let razorpay = null;
if (process.env.RAZORPAY_KEY && process.env.RAZORPAY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
  });
  console.log('Razorpay Protocol - INITIALIZED');
} else {
  console.warn('Razorpay Protocol - DISABLED (Missing Credentials)');
}

// --- AUTH MIDDLEWARE ---
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Authentication required' });

    const decoded = jwt.verify(token, JWT_SECRET);
    req.adminId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired session' });
  }
};

// --- PUBLIC ROUTES ---

app.get('/', (req, res) => {
  res.send('ArcPay Secure Gateway - ACTIVE');
});

// Fetch global settings (Maintenance Mode, etc)
app.get('/api/public/settings', async (req, res) => {
  try {
    const settings = await Settings.findOne().select('isMaintenanceMode maintenanceEndTime maintenanceMessage requirePasscode isArcPayBlocked updatedAt');
    res.json(settings || {});
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch protocol settings' });
  }
});

// Verify landing page passcode
app.post('/api/public/verify-passcode', async (req, res) => {
  try {
    const { passcode } = req.body;
    const settings = await Settings.findOne();
    
    if (!settings || !settings.requirePasscode) {
      return res.json({ success: true, message: "Passcode verification bypassed" });
    }

    if (passcode === settings.passcode) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, error: 'Invalid security code' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Security handshake failed' });
  }
});

// Check link status for payer
app.get('/api/links/status/:linkId', async (req, res) => {
  try {
    const link = await Link.findOne({ linkId: req.params.linkId });
    if (!link) return res.status(404).json({ error: 'Link not found' });
    res.json({ status: link.status });
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify link' });
  }
});

// Register a new link from the creator tool
app.post('/api/links/register', async (req, res) => {
  try {
    const { linkId, amount, name, payerName, note, invoiceId, paymentMethod, fullUrl } = req.body;

    // Check if link already exists to avoid duplicates
    const existing = await Link.findOne({ linkId });
    if (existing) {
      if (fullUrl) {
        existing.fullUrl = fullUrl;
        await existing.save();
      }
      return res.json({ success: true, message: 'Existing link logged' });
    }

    await Link.create({
      linkId, amount, name, payerName, note, invoiceId, paymentMethod, fullUrl,
      status: 'PENDING'
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ error: 'Failed to register link persistence' });
  }
});

app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency, receipt, notes, metadata } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: currency || "INR",
      receipt: receipt || `rcpt_${Math.random().toString(36).substring(7)}`,
      payment_capture: 1,
      notes: notes || {}
    };

    const order = await razorpay.orders.create(options);

    // PERSIST OR UPDATE IN DATABASE
    if (metadata) {
      await Link.findOneAndUpdate(
        { linkId: metadata.linkId },
        {
          status: 'PENDING', // Still pending until user actually pays
          amount: amount,
          name: metadata.name,
          note: metadata.note,
          payerName: metadata.payerName,
          invoiceId: metadata.invoiceId,
          paymentMethod: 'razorpay',
          txId: order.id
        },
        { upsert: true }
      );
    }

    res.status(200).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    res.status(500).json({ error: 'Failed to create secure transaction order' });
  }
});

// --- AUTH ENDPOINTS ---

// First-time setup
app.post('/api/auth/setup', async (req, res) => {
  try {
    const adminExists = await Admin.findOne();
    if (adminExists) return res.status(403).json({ error: 'Admin already configured' });

    const { email, password, businessName } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      email,
      password: hashedPassword,
      businessName
    });

    res.json({ success: true, message: 'Admin authenticated and locked' });
  } catch (err) {
    res.status(500).json({ error: 'Setup failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token, businessName: admin.businessName });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// --- ADMIN PROTECTED ROUTES ---

app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
  try {
    const totalLinks = await Link.countDocuments();
    const settledLinks = await Link.find({ status: 'SETTLED' });
    const totalRevenue = settledLinks.reduce((acc, curr) => acc + curr.amount, 0);
    const unsettledCount = await Link.countDocuments({ 
      status: { $in: ['PENDING', 'SUBMITTED'] } 
    });

    // 14-Day Revenue Aggregation
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const statsPipeline = [
      {
        $match: {
          status: 'SETTLED',
          $or: [
            { settledAt: { $gte: fourteenDaysAgo } },
            { $and: [{ settledAt: { $exists: false } }, { createdAt: { $gte: fourteenDaysAgo } }] }
          ]
        }
      },
      {
        $group: {
          _id: { $dateToString: { 
            format: "%Y-%m-%d", 
            date: { $ifNull: ["$settledAt", "$createdAt"] } 
          } },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ];

    const rawDailyStats = await Link.aggregate(statsPipeline);

    // Map to a complete 14-day array (fill gaps with zeros)
    const dailyStats = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const match = rawDailyStats.find(s => s._id === dateStr);
      dailyStats.push({
        date: dateStr,
        revenue: match ? match.revenue : 0,
        count: match ? match.count : 0
      });
    }

    res.json({
      totalLinks,
      totalRevenue,
      pendingCount: unsettledCount,
      settledCount: settledLinks.length,
      dailyStats
    });
  } catch (err) {
    console.error('Stats aggregation error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

app.get('/api/admin/links', authenticateAdmin, async (req, res) => {
  try {
    const links = await Link.find().sort({ createdAt: -1 });
    res.json(links);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch links' });
  }
});

app.patch('/api/admin/links/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const update = { status };
    if (status === 'SETTLED') {
      update.settledAt = new Date();
    }
    const link = await Link.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(link);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update link status' });
  }
});

app.delete('/api/admin/links/:id', authenticateAdmin, async (req, res) => {
  try {
    await Link.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Link permanently removed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete link' });
  }
});

// Update global settings (Maintenance Mode toggle)
app.post('/api/admin/settings', authenticateAdmin, async (req, res) => {
  try {
    const { 
      isMaintenanceMode, 
      maintenanceEndTime, 
      maintenanceMessage,
      requirePasscode,
      isArcPayBlocked,
      passcode 
    } = req.body;

    const updateData = { 
      isMaintenanceMode, 
      maintenanceEndTime, 
      maintenanceMessage, 
      updatedAt: new Date() 
    };

    if (requirePasscode !== undefined) updateData.requirePasscode = requirePasscode;
    if (isArcPayBlocked !== undefined) updateData.isArcPayBlocked = isArcPayBlocked;
    if (passcode !== undefined) updateData.passcode = passcode;

    const settings = await Settings.findOneAndUpdate(
      {}, 
      updateData,
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'System update failed' });
  }
});

app.patch('/api/links/settle/:linkId', async (req, res) => {
  try {
    const { txId } = req.body;
    let link = await Link.findOne({ linkId: req.params.linkId });
    if (!link) return res.status(404).json({ error: 'Link identity not found' });

    // Mark as SUBMITTED for manual verification, except for automatic gateways
    const newStatus = link.paymentMethod === 'razorpay' ? 'SETTLED' : 'SUBMITTED';

    const update = {
      status: newStatus,
      txId: txId
    };
    
    if (newStatus === 'SETTLED') {
      update.settledAt = new Date();
    }

    link = await Link.findByIdAndUpdate(link._id, update, { new: true });
    res.json({ success: true, link });
  } catch (err) {
    res.status(500).json({ error: 'Settlement update failed' });
  }
});

// New Public Verification Endpoint
app.get('/api/links/:linkId/verify', async (req, res) => {
  try {
    const link = await Link.findOne({ linkId: req.params.linkId });
    if (!link) {
      return res.status(404).json({ success: false, status: 'NOT_FOUND', message: 'Link identity not found on this node.' });
    }
    res.json({ success: true, status: link.status });
  } catch (err) {
    res.status(500).json({ error: 'Security verification failed' });
  }
});

app.listen(port, () => {
  console.log(`ArcPay Secure Gateway running on port ${port}`);
});
