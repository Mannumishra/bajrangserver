const User = require('../Model/UserModel');
const Otp = require('../Model/OtpModel');
const nodemailer = require('nodemailer');
const fs = require("fs")
const { uploadimage } = require('../Utils/Cloudnary');
// const PDFDocument = require('pdfkit');
const htmlToPdf = require('html-pdf');
const Razorpay = require('razorpay');
const crypto = require('crypto');


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.EMAIL_SEND || "mannu22072000@gmail.com",
    pass: process.env.EMAIL_PASS || "zmkm jaky wltr tlhp"
  }
});


// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_XPcfzOlm39oYi8",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "Q79P6w7erUar31TwW4GLAkpa",
});

exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.create({ email, otp });
    await transporter.sendMail({
      from: process.env.EMAIL_SEND || "mannu22072000@gmail.com",
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}`
    });

    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (err) {
    console.log(err)
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


const createHtmlContent = (user) => `
  <div style="width: 600px; padding: 20px; background-color: #e6a15c; border: 2px solid #c0440d; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
          <!-- Add the logo here -->
          <img src="https://www.bajrangvahinidal.com/uploads/1698868863_4b65b39f091f43c03be2.png" alt="बजरंग वाहिनी दल Logo" style="width: 100px; height: auto; margin-bottom: 10px;">
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
      <div style="text-align: right; margin-top: 20px;">
          <!-- Add the signature image here -->
          <img src="https://res.cloudinary.com/dsimn9z1r/image/upload/fl_preserve_transparency/v1723179469/WhatsApp_Image_2024-08-09_at_10.19.27-removebg_ozu41s.jpg?_s=public-apps" alt="Signature" style="width: 100px; height: auto; margin-bottom: 5px;">
          <p style="font-size: 18px; color: #000;">अधिकृत हस्ताक्षर</p>
      </div>
  </div>
`;

exports.signup = async (req, res) => {
  const { title, name, email, paranrsName, phone, address, city, state, paymentMethod, donationAmount, checkNumber } = req.body;
  try {
    if (paymentMethod === "Offline") {
      const user = new User({ title, name, paranrsName, email, phone, address, city, state, paymentMethod, checkNumber, donationAmount });
      if (req.file) {
        const imageurl = await uploadimage(req.file.path);
        user.image = imageurl;
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting the file:', unlinkError);
        }
      }
      await user.save()
      const htmlContent = createHtmlContent(user);
      htmlToPdf.create(htmlContent).toBuffer(async (err, buffer) => {
        if (err) {
          return res.status(500).json({ message: 'Error generating PDF' });
        }
        await transporter.sendMail({
          from: process.env.EMAIL_SEND || "mannu22072000@gmail.com",
          to: user.email,
          subject: 'Donate Successfully',
          text: 'Thank you for your donation!',
          attachments: [{
            filename: 'donation_receipt.pdf',
            content: buffer,
          }]
        });
        await transporter.sendMail({
          from: process.env.EMAIL_SEND || "mannu22072000@gmail.com",
          to: process.env.EMAIL_SEND || "mannu22072000@gmail.com",
          subject: 'Donation Received',
          text: 'A donation has been made.',
          attachments: [{
            filename: 'donation_receipt.pdf',
            content: buffer,
          }]
        });
        res.status(200).json({
          success: true,
          message: 'User donation successfully.',
        });
      });
    } else {
      const options = {
        amount: donationAmount * 100,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        payment_capture: 1
      };
      const order = await razorpay.orders.create(options); // Use razorpay here
      const user = new User({ title, name, paranrsName, email, phone, address, city, state, paymentMethod, donationAmount });
      if (req.file) {
        const imageurl = await uploadimage(req.file.path);
        user.image = imageurl;
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting the file:', unlinkError);
        }
      }
      await user.save()
      user.razorpayOrderId = order.id;
      res.status(200).json({
        success: true,
        message: 'User registered successfully. Please complete the payment.',
        orderId: order.id,
        userId: user._id,
        amount: order.amount,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Error registering user' });
  }
};

// Step 3: Payment verification endpoint
exports.verifyPayment = async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, userId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    const generated_signature = crypto.createHmac('sha256', 'Q79P6w7erUar31TwW4GLAkpa')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid signature' });
    }
    user.razorpayPaymentId = razorpay_payment_id;
    user.razorpayOrderId = razorpay_order_id;
    user.paymentStatus = 'Completed';
    await user.save();
    const htmlContent = createHtmlContent(user);
    htmlToPdf.create(htmlContent).toBuffer(async (err, buffer) => {
      if (err) {
        return res.status(500).json({ message: 'Error generating PDF' });
      }
      await transporter.sendMail({
        from: process.env.EMAIL_SEND || "mannu22072000@gmail.com",
        to: user.email,
        subject: 'Donation Receipt',
        text: 'Thank you for your donation!',
        attachments: [{
          filename: 'donation_receipt.pdf',
          content: buffer,
        }]
      });
      await transporter.sendMail({
        from: process.env.EMAIL_SEND || "mannu22072000@gmail.com",
        to: process.env.EMAIL_SEND || "mannu22072000@gmail.com",
        subject: 'Donation Received',
        text: 'A donation has been made.',
        attachments: [{
          filename: 'donation_receipt.pdf',
          content: buffer,
        }]
      });
      res.status(200).json({
        success: true,
        message: 'Payment verified successfully and user updated.',
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Error verifying payment' });
  }
};

