const User = require('../Model/UserModel');
const Otp = require('../Model/OtpModel');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: 'mannu22072000@gmail.com',
    pass: 'zmkm jaky wltr tlhp'
  }
});

exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  console.log(req.body)
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
    await Otp.create({ email, otp });
    await transporter.sendMail({
      from: 'mannu22072000@gmail.com',
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}`
    });

    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (err) {
    if (err.response && err.response.includes('address not found')) {
      return res.status(400).json({ message: 'Email address not found' });
    }
    res.status(500).json({ message: 'Error sending OTP' });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    await Otp.deleteMany({ email }); 
    res.status(200).json({ message: 'OTP verified' });
  } catch (err) {
    res.status(500).json({ message: 'Error verifying OTP' });
  }
};

exports.signup = async (req, res) => {
  const { name, email, phone } = req.body;
  try {
    const user = new User({ name, email, phone });
    await user.save();

    res.status(200).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error registering user' });
  }
};
