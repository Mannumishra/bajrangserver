const User = require('../Model/UserModel');
const Otp = require("../Model/OtpModel");
const nodemailer = require('nodemailer');
const fs = require("fs");
const { uploadimage } = require('../Utils/Cloudnary');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { text } = require('express');

// Initialize Nodemailer
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.EMAIL_SEND || "bajrangvahinidal@gmail.com",
    pass: process.env.EMAIL_PASS || "uyow ripi dqpz jcjp",
  }
});

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_live_nBUB1UpgrIMZ2m",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "c40PdeTNa6zHKHRxxPoXtfqp",
});


exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.create({ email, otp });

    await transporter.sendMail({
      from: process.env.EMAIL_SEND || "bajrangvahinidal@gmail.com",
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}`
    });

    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (err) {
    console.error(err);
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
    console.error('Error verifying OTP:', err);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
};

exports.signup = async (req, res) => {
  const { title, name, email, paranrsName, phone, address, city, state, paymentMethod, donationAmount, checkNumber, adharnumber } = req.body;
  try {
    const user = new User({ title, name, paranrsName, email, phone, address, city, state, paymentMethod, checkNumber, donationAmount, adharnumber });

    // Image Handling
    if (req.files) {
      if (req.files.image) {
        const imageurl = await uploadimage(req.files.image[0].path);
        user.image = imageurl
        fs.unlinkSync(image[0].path);
      }
      if (req.files.adharcardFront) {
        const imageurl = await uploadimage(req.files.adharcardFront[0].path);
        user.adharcardFront = imageurl
        fs.unlinkSync(req.files.adharcardFront[0].path);
      }
      if (req.files.adharcardBack) {
        const imageurl = await uploadimage(req.files.adharcardBack[0].path);
        user.adharcardBack = imageurl
        fs.unlinkSync(req.files.adharcardBack[0].path);
      }
    }
    await user.save();
    if (paymentMethod === "Offline") {
      res.status(200).json({ success: true, message: 'User donation successful.' });
    } else {
      // Handle Online Payment
      const options = {
        amount: donationAmount * 100, // Amount in paise
        currency: "INR",
        receipt: user._id.toString(),
      };

      const order = await razorpay.orders.create(options);

      user.razorpayOrderId = order.id;
      await user.save();

      res.status(200).json({ success: true, message: 'Order created successfully.', orderId: order.id });
    }
  } catch (err) {
    console.error('Error in signup:', err);
    res.status(500).json({ success: false, message: 'Signup failed.' });
  }
};

exports.paymentVerification = async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
  try {
    const user = await User.findOne({ razorpayOrderId: razorpay_order_id });
    if (!user) {
      return res.status(400).json({ message: 'Order not found' });
    }

    // Verify payment signature
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "c40PdeTNa6zHKHRxxPoXtfqp");
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    user.razorpayPaymentId = razorpay_payment_id;
    user.isPaid = true;
    await user.save();
    res.status(200).json({ success: true, message: 'Payment verified and receipt sent.' });
  } catch (err) {
    console.error('Error verifying payment:', err);
    res.status(500).json({ message: 'Payment verification failed' });
  }
};
exports.getRecord = async (req, res) => {
  try {
    const data = await User.find()
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "REcord Not Found"
      })
    }
    else {
      res.status(200).json({
        success: true,
        message: "User Found successfully",
        data: data
      })
    }
  } catch (error) {
    console.log(error)
  }
}

exports.getSingleRecord = async (req, res) => {
  try {
    const data = await User.findOne({ _id: req.params._id })
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "REcord Not Found"
      })
    }
    else {
      res.status(200).json({
        success: true,
        message: "User Found successfully",
        data: data
      })
    }
  } catch (error) {
    console.log(error)
  }
}