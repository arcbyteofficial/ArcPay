const express = require('express');
const cors = require('cors');
const Razorpay = require('razorpay');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configuration for ArcPay Ecology
app.use(express.json());
app.use(cors({
  origin: ['https://pay.arcbyte.co', 'http://localhost:5173'], // Allow local dev and production
  methods: ['GET', 'POST'],
  credentials: true
}));

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

// Health check
app.get('/', (req, res) => {
  res.send('ArcPay Secure Gateway - ACTIVE');
});

// Order Creation Endpoint
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency, receipt, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const options = {
      amount: Math.round(amount * 100), // convert to subunits (paise)
      currency: currency || "INR",
      receipt: receipt || `rcpt_${Math.random().toString(36).substring(7)}`,
      payment_capture: 1, // ENFORCE INSTANT CAPTURE
      notes: notes || {}
    };

    const order = await razorpay.orders.create(options);
    
    res.status(200).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    res.status(500).json({ 
      error: 'Failed to create secure transaction order', 
      details: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`ArcPay Secure Gateway running on port ${port}`);
});
