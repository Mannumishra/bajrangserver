const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true }
});

module.exports = mongoose.model('Otp', OtpSchema);
