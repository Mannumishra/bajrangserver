const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  title: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  image: { type: String }, // Assuming this is a URL or file path
  paymentMethod: { type: String }, // Could be 'Credit Card', 'PayPal', etc.
  donationAmount: { type: Number } // Assuming this is a numeric value
});

module.exports = mongoose.model('User', UserSchema);
