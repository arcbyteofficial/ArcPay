const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  isMaintenanceMode: {
    type: Boolean,
    default: false
  },
  requirePasscode: {
    type: Boolean,
    default: true
  },
  isArcPayBlocked: {
    type: Boolean,
    default: false
  },
  passcode: {
    type: String,
    default: "151903"
  },
  maintenanceEndTime: {
    type: Date,
    default: null
  },
  maintenanceMessage: {
    type: String,
    default: "We are perfecting the protocol. ArcPay will be back online shortly."
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  razorpayApiKey: {
    type: String,
    default: ""
  },
  razorpayApiSecret: {
    type: String,
    default: ""
  }
});

module.exports = mongoose.model('Settings', SettingsSchema);
