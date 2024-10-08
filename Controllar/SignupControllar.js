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
    pass: process.env.EMAIL_PASS || "eqzm yvte htwr vfra",
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
      const { image, adharcardFront, adharcardBack } = req.files;
      try {
        if (image && image[0].path) {
          if (fs.existsSync(image[0].path)) {
            user.image = await uploadimage(image[0].path);
            fs.unlinkSync(image[0].path);
          } else {
            throw new Error('Image file not found after upload');
          }
        }
        if (adharcardFront && adharcardFront[0].path) {
          if (fs.existsSync(adharcardFront[0].path)) {
            user.adharcardFront = await uploadimage(adharcardFront[0].path);
            fs.unlinkSync(adharcardFront[0].path);
          } else {
            throw new Error('Aadhaar front image file not found after upload');
          }
        }
        if (adharcardBack && adharcardBack[0].path) {
          if (fs.existsSync(adharcardBack[0].path)) {
            user.adharcardBack = await uploadimage(adharcardBack[0].path);
            fs.unlinkSync(adharcardBack[0].path);
          } else {
            throw new Error('Aadhaar back image file not found after upload');
          }
        }
      } catch (err) {
        console.error('File handling error:', err);
        return res.status(500).json({ success: false, message: 'File handling failed.' });
      }
    }

    await user.save();
    if (paymentMethod === "Offline") {
      const mailOptions = {
        from: process.env.EMAIL_SEND || "bajrangvahinidal@gmail.com",
        to: user.email,
        subject: 'Thank You for Joining Bajrang Vahini Dal',
        html: `
          <div style="max-width: 100%; padding: 20px; background-color: #e6a15c; border: 2px solid #c0440d; border-radius: 10px; margin: auto; box-sizing: border-box;">
              <div style="text-align: center; margin-bottom: 20px;">
                  <img src="https://bajrangvahinidal.com/static/media/1698868863_4b65b39f091f43c03be2.04be49a70e991ff03f4e.png" alt="बजरंग वाहिनी दल Logo" style="width: 100px; height: auto; margin-bottom: 10px;">
                  <h1 style="font-size: 28px; margin: 0; color: #d02626;">बजरंग वाहिनी दल</h1>
                  <p style="font-size: 14px; color: #000;">226, शटर वाली गली, गांव खानपुर, नई दिल्ली - 110062 (भारत)</p>
              </div>
              <div style="margin-bottom: 15px;">
                  <label style="font-size: 16px; color: #000;">श्री/श्रीमति:</label>
                  <p style="font-size: 14px; padding: 8px; background-color: #fff; border-radius: 4px;">${user.name}</p>
              </div>
              <div style="margin-bottom: 15px;">
                  <label style="font-size: 16px; color: #000;">पता:</label>
                  <p style="font-size: 14px; padding: 8px; background-color: #fff; border-radius: 4px;">${user.address}</p>
              </div>
              <div style="margin-bottom: 15px;">
                  <label style="font-size: 16px; color: #000;">दूरभाष:</label>
                  <p style="font-size: 14px; padding: 8px; background-color: #fff; border-radius: 4px;">${user.phone}</p>
              </div>
              <div style="margin-bottom: 15px;">
                  <label style="font-size: 16px; color: #000;">ई मेल:</label>
                  <p style="font-size: 14px; padding: 8px; background-color: #fff; border-radius: 4px;">${user.email}</p>
              </div>
              <div style="margin-bottom: 15px;">
                  <label style="font-size: 16px; color: #000;">माता/पिता का नाम:</label>
                  <p style="font-size: 14px; padding: 8px; background-color: #fff; border-radius: 4px;">${user.paranrsName}</p>
              </div>
              <div style="margin-bottom: 15px;">
                  <label style="font-size: 16px; color: #000;">राशि (शब्दों में):</label>
                  <p style="font-size: 14px; padding: 8px; background-color: #fff; border-radius: 4px;">${user.donationAmount}</p>
              </div>
              <div style="margin-bottom: 15px;">
                  <label style="font-size: 16px; color: #000;">नकद/ड्राफ्ट/डिजिटल/चेक नं:</label>
                  <p style="font-size: 14px; padding: 8px; background-color: #fff; border-radius: 4px;">${user.paymentMethod}</p>
              </div>
              ${user.paymentMethod === 'Online' ? `
              <div style="margin-bottom: 15px;">
                  <label style="font-size: 16px; color: #000;">पेमेंट आईडी:</label>
                  <p style="font-size: 14px; padding: 8px; background-color: #fff; border-radius: 4px;">${user.razorpayOrderId}</p>
              </div>` : ''}
              <div style="margin-bottom: 15px;">
                  <label style="font-size: 16px; color: #000;">आधार कार्ड नंबर:</label>
                  <p style="font-size: 14px; padding: 8px; background-color: #fff; border-radius: 4px;">${user.adharnumber}</p>
              </div>
              <div style="text-align: right; margin-top: 20px;">
                  <img src="https://res.cloudinary.com/dsimn9z1r/image/upload/fl_preserve_transparency/v1723179469/WhatsApp_Image_2024-08-09_at_10.19.27-removebg_ozu41s.jpg?_s=public-apps" alt="Signature" style="width: 100px; height: auto; margin-bottom: 5px;">
                  <p style="font-size: 18px; color: #000;">अधिकृत हस्ताक्षर</p>
              </div>
              <style>
                @media (max-width: 600px) {
                  .container {
                    width: 100% !important;
                    padding: 10px !important;
                  }
                  .container img {
                    width: 100% !important;
                    height: auto !important;
                  }
                  .container h1 {
                    font-size: 24px !important;
                  }
                  .container p {
                    font-size: 12px !important;
                  }
                  .container label {
                    font-size: 14px !important;
                  }
                }
              </style>
          </div>
        `
      };

      const adminMailOptions = {
        from: process.env.EMAIL_SEND || "bajrangvahinidal@gmail.com",
        to: process.env.EMAIL_SEND || "bajrangvahinidal@gmail.com",
        subject: 'New Member Request And Receipt',
        text: `A new member registration done successfully.`,
      };

      await transporter.sendMail(mailOptions);
      await transporter.sendMail(adminMailOptions);
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
    const mailOptions = {
      from: process.env.EMAIL_SEND || "bajrangvahinidal@gmail.com",
      to: user.email,
      subject: 'Thank You for Joining Bajrang Vahini Dal',
      html: `
        <div style="max-width: 100%; padding: 20px; background-color: #e6a15c; border: 2px solid #c0440d; border-radius: 10px; margin: auto; box-sizing: border-box;">
            <div style="text-align: center; margin-bottom: 20px;">
                <img src="https://bajrangvahinidal.com/static/media/1698868863_4b65b39f091f43c03be2.04be49a70e991ff03f4e.png" alt="बजरंग वाहिनी दल Logo" style="width: 100px; height: auto; margin-bottom: 10px;">
                <h1 style="font-size: 28px; margin: 0; color: #d02626;">बजरंग वाहिनी दल</h1>
                <p style="font-size: 14px; color: #000;">226, शटर वाली गली, गांव खानपुर, नई दिल्ली - 110062 (भारत)</p>
            </div>
            <div style="margin-bottom: 15px;">
                <label style="font-size: 16px; color: #000;">श्री/श्रीमति:</label>
                <p style="font-size: 14px; padding: 8px; background-color: #fff; border-radius: 4px;">${user.name}</p>
            </div>
            <div style="margin-bottom: 15px;">
                <label style="font-size: 16px; color: #000;">पता:</label>
                <p style="font-size: 14px; padding: 8px; background-color: #fff; border-radius: 4px;">${user.address}</p>
            </div>
            <div style="margin-bottom: 15px;">
                <label style="font-size: 16px; color: #000;">दूरभाष:</label>
                <p style="font-size: 14px; padding: 8px; background-color: #fff; border-radius: 4px;">${user.phone}</p>
            </div>
            <div style="margin-bottom: 15px;">
                <label style="font-size: 16px; color: #000;">ई मेल:</label>
                <p style="font-size: 14px; padding: 8px; background-color: #fff; border-radius: 4px;">${user.email}</p>
            </div>
            <div style="margin-bottom: 15px;">
                <label style="font-size: 16px; color: #000;">माता/पिता का नाम:</label>
                <p style="font-size: 14px; padding: 8px; background-color: #fff; border-radius: 4px;">${user.paranrsName}</p>
            </div>
            <div style="margin-bottom: 15px;">
                <label style="font-size: 16px; color: #000;">राशि (शब्दों में):</label>
                <p style="font-size: 14px; padding: 8px; background-color: #fff; border-radius: 4px;">${user.donationAmount}</p>
            </div>
            <div style="margin-bottom: 15px;">
                <label style="font-size: 16px; color: #000;">नकद/ड्राफ्ट/डिजिटल/चेक नं:</label>
                <p style="font-size: 14px; padding: 8px; background-color: #fff; border-radius: 4px;">${user.paymentMethod}</p>
            </div>
            ${user.paymentMethod === 'Online' ? `
            <div style="margin-bottom: 15px;">
                <label style="font-size: 16px; color: #000;">पेमेंट आईडी:</label>
                <p style="font-size: 14px; padding: 8px; background-color: #fff; border-radius: 4px;">${user.razorpayOrderId}</p>
            </div>` : ''}
            <div style="margin-bottom: 15px;">
                <label style="font-size: 16px; color: #000;">आधार कार्ड नंबर:</label>
                <p style="font-size: 14px; padding: 8px; background-color: #fff; border-radius: 4px;">${user.adharnumber}</p>
            </div>
            <div style="text-align: right; margin-top: 20px;">
                <img src="https://res.cloudinary.com/dsimn9z1r/image/upload/fl_preserve_transparency/v1723179469/WhatsApp_Image_2024-08-09_at_10.19.27-removebg_ozu41s.jpg?_s=public-apps" alt="Signature" style="width: 100px; height: auto; margin-bottom: 5px;">
                <p style="font-size: 18px; color: #000;">अधिकृत हस्ताक्षर</p>
            </div>
            <style>
              @media (max-width: 600px) {
                .container {
                  width: 100% !important;
                  padding: 10px !important;
                }
                .container img {
                  width: 100% !important;
                  height: auto !important;
                }
                .container h1 {
                  font-size: 24px !important;
                }
                .container p {
                  font-size: 12px !important;
                }
                .container label {
                  font-size: 14px !important;
                }
              }
            </style>
        </div>
      `
    };

    const adminMailOptions = {
      from: process.env.EMAIL_SEND || "bajrangvahinidal@gmail.com",
      to: process.env.EMAIL_SEND || "bajrangvahinidal@gmail.com",
      subject: 'New Member Request And Receipt',
      text: `A new member registration done successfully.`,
    };

    await transporter.sendMail(mailOptions);
    await transporter.sendMail(adminMailOptions);
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