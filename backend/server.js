const express = require('express');
const cors = require('cors');
const Razorpay = require('razorpay');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
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
    await initializeRazorpay();
  })
  .catch(err => {
    console.error('Database Connection Error - FAILED');
    console.error(`Error Details: ${err.message}`);
    console.error('CRITICAL: Check if your local IP is whitelisted in Railway Dashboard > MongoDB > Settings > Public Networking.');
  });

// --- SECURITY MIDDLEWARES ---
app.use(helmet());
app.use(mongoSanitize({ replaceWith: '_' }));
app.use(xss());
app.use(hpp());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Traffic volume exceeded threshold. Temporary network freeze.' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(globalLimiter);

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['https://pay.arcbyte.co', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true
}));

const authLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30-minute strict lockout
  max: 5,
  message: { error: 'Authentication threshold vastly exceeded. IP strictly locked for 30 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

let razorpay = null;

const initializeRazorpay = async () => {
  try {
    const settings = await Settings.findOne();
    const key = settings?.razorpayApiKey || process.env.RAZORPAY_KEY;
    const secret = settings?.razorpayApiSecret || process.env.RAZORPAY_SECRET;

    if (key && secret) {
      razorpay = new Razorpay({ key_id: key, key_secret: secret });
      console.log('Razorpay Protocol - SECURELY INITIALIZED');
    } else {
      razorpay = null;
      console.warn('Razorpay Protocol - DISABLED (Awaiting Credentials)');
    }
  } catch (err) {
    console.error('Razorpay Init Error:', err);
  }
};

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

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    if (admin.isTwoFactorEnabled) {
      // Issue a temporary 5-min token for the OTP challenge
      const tempToken = jwt.sign({ id: admin._id, isTemp: true }, JWT_SECRET, { expiresIn: '5m' });
      return res.json({ success: true, require2FA: true, tempToken });
    }

    const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token, businessName: admin.businessName });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/verify-2fa', authLimiter, async (req, res) => {
  try {
    const { tempToken, code } = req.body;
    if (!tempToken || !code) return res.status(400).json({ error: 'Missing security parameters' });

    try {
      const decoded = jwt.verify(tempToken, JWT_SECRET);
      if (!decoded.isTemp) return res.status(401).json({ error: 'Invalid token structure' });

      const admin = await Admin.findById(decoded.id);
      if (!admin || !admin.isTwoFactorEnabled) return res.status(401).json({ error: 'Invalid origin state' });

      const verified = speakeasy.totp.verify({
        secret: admin.twoFactorSecret,
        encoding: 'base32',
        token: code,
        window: 1 // Allow 30 seconds drift before/after
      });

      if (!verified) return res.status(401).json({ error: 'Invalid or expired 2FA code' });

      const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ success: true, token, businessName: admin.businessName });
    } catch (err) {
      res.status(401).json({ error: 'Temporary session expired' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Verification payload dropped' });
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
    const now = new Date();
    // Use local midnight for the starting point
    const fourteenDaysAgo = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
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
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: { $ifNull: ["$settledAt", "$createdAt"] },
              timezone: "Asia/Kolkata"
            }
          },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ];

    const rawDailyStats = await Link.aggregate(statsPipeline);

    // Map to a complete 14-day array (fill gaps with zeros)
    const dailyStats = [];
    const localToday = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    
    for (let i = 13; i >= 0; i--) {
      const d = new Date(localToday);
      d.setDate(localToday.getDate() - i);
      
      // Manual formatting to ensure YYYY-MM-DD in local time
      const year = d.getFullYear();
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
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

// --- GATEWAY CONFIGURATION ROUTES ---

app.get('/api/admin/gateway', authenticateAdmin, async (req, res) => {
  try {
    const settings = await Settings.findOne() || {};
    res.json({
      razorpayApiKey: settings.razorpayApiKey || process.env.RAZORPAY_KEY || "",
      // Mask the secret for safe UI rendering
      razorpayApiSecret: (settings.razorpayApiSecret || process.env.RAZORPAY_SECRET) ? "sk_live_*******************" : ""
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch gateway configuration' });
  }
});

app.post('/api/admin/gateway', authenticateAdmin, async (req, res) => {
  try {
    const { razorpayApiKey, razorpayApiSecret } = req.body;

    const updateData = {};
    if (razorpayApiKey !== undefined) updateData.razorpayApiKey = razorpayApiKey;
    // Don't override with mask if submitted blindly
    if (razorpayApiSecret !== undefined && !razorpayApiSecret.includes('***')) {
      updateData.razorpayApiSecret = razorpayApiSecret;
    }

    await Settings.findOneAndUpdate({}, updateData, { new: true, upsert: true });

    // Hot-reload the gateway parameters dynamically on the node
    await initializeRazorpay();

    res.json({ success: true, message: 'Gateway configurations bound successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update gateway configurations. Hot-reload aborted.' });
  }
});

// --- ADMIN 2FA ROUTES ---

app.get('/api/admin/2fa/status', authenticateAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId);
    if (!admin) return res.status(404).json({ error: 'Identity dropped' });
    res.json({ isTwoFactorEnabled: !!admin.isTwoFactorEnabled });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve 2FA status' });
  }
});

app.get('/api/admin/2fa/generate', authenticateAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId);
    if (!admin) return res.status(404).json({ error: 'Admin identity lost' });

    const secret = speakeasy.generateSecret({
      name: `ArcPay (${admin.businessName})`
    });

    qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) return res.status(500).json({ error: 'Failed to generate cryptographic visual payload' });
      res.json({
        secret: secret.base32,
        qrCode: data_url
      });
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate 2FA node secret' });
  }
});

app.post('/api/admin/2fa/enable', authenticateAdmin, async (req, res) => {
  try {
    const { code, secret } = req.body;
    const admin = await Admin.findById(req.adminId);

    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: code,
      window: 1
    });

    if (verified) {
      admin.twoFactorSecret = secret;
      admin.isTwoFactorEnabled = true;
      await admin.save();
      res.json({ success: true, message: 'Two-Factor Authentication securely locked' });
    } else {
      res.status(400).json({ error: 'Algorithmic code mismatch, try again' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to lock 2FA state' });
  }
});

app.post('/api/admin/2fa/disable', authenticateAdmin, async (req, res) => {
  try {
    const { code } = req.body;
    const admin = await Admin.findById(req.adminId);

    const verified = speakeasy.totp.verify({
      secret: admin.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 1
    });

    if (verified) {
      admin.isTwoFactorEnabled = false;
      admin.twoFactorSecret = undefined;
      await admin.save();
      res.json({ success: true, message: 'Two-Factor Authentication dismantled' });
    } else {
      res.status(400).json({ error: 'Algorithmic code mismatch' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to unlock 2FA state' });
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
