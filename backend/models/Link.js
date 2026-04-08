const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  linkId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  name: { type: String, required: true },
  note: { type: String },
  payerName: { type: String },
  payerEmail: { type: String },
  payerPhone: { type: String },
  invoiceId: { type: String },
  paymentMethod: { type: String, enum: ['upi', 'razorpay', 'bank'], default: 'upi' },
  status: { type: String, enum: ['PENDING', 'SUBMITTED', 'SETTLED', 'INVALID'], default: 'PENDING' },
  txId: { type: String }, // Transaction / UTR / Order ID
  fullUrl: { type: String }, // NEW: Store the generated pay_id signed URL
  createdAt: { type: Date, default: Date.now },
  settledAt: { type: Date }
});

module.exports = mongoose.model('Link', linkSchema);
