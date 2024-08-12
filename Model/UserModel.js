const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  title: { type: String },
  name: { type: String, required: true },
  paranrsName: { type: String },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  image: { type: String },
  adharnumber: { type: Number, required: true },
  adharcardFront: { type: String, required: true },
  adharcardBack: { type: String, required: true },
  paymentMethod: { type: String, default: "Online" },
  donationAmount: { type: Number, required: true },
  razorpayOrderId: { type: String },
  paymentStatus: { type: String, default: "Pending" },
  checkNumber: { type: String }
});

module.exports = mongoose.model('User', UserSchema);
