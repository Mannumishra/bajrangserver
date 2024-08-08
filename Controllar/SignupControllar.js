const User = require('../Model/UserModel');
const Otp = require('../Model/OtpModel');
const nodemailer = require('nodemailer');
const fs = require("fs")
const { uploadimage } = require('../Utils/Cloudnary');

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
  console.log(req.body)
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
  console.log(req.body)
  console.log(req.file)
  const {
    title,
    name,
    email,
    phone,
    address,
    city,
    state,
    paymentMethod,
    donationAmount,
  } = req.body;

  try {
    const user = new User({
      title,
      name,
      email,
      phone,
      address,
      city,
      state,
      paymentMethod,
      donationAmount,
    });
    if (req.file) {
      const imageurl = await uploadimage(req.file.path)
      user.image = imageurl
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting the file:', unlinkError);
      }
    }
    await user.save();
    res.status(200).json({
      success: true,
      message: 'User registered successfully',
      data: user
    });
    await transporter.sendMail({
      from: 'mannu22072000@gmail.com',
      to: email,
      subject: 'Donate Successfully',
      text: 'Thank you for your donation!',
      name: name
    })
    await transporter.sendMail({
      from: 'mannu22072000@gmail.com',
      to: "mannu22072000@gmail.com",
      subject: 'Donate Successfully',
      text: 'Thank you for your donation!',
      name: name
    })
  } catch (err) {
    if (err.name === 'MongoError' && err.code === 11000) {
      res.status(400).json({ message: 'Email or phone already exists' });
    } else {
      res.status(500).json({ message: 'Error registering user' });
    }
  }
};

