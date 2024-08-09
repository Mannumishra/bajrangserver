const User = require('../Model/UserModel');
const Otp = require('../Model/OtpModel');
const nodemailer = require('nodemailer');
const fs = require("fs")
const { uploadimage } = require('../Utils/Cloudnary');
const { sendEmailWithPDF } = require('../Utils/NodeMailer');
const PDFDocument = require('pdfkit');
const htmlToPdf = require('html-pdf');

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
  const { title, name, email, phone, address, city, state, paymentMethod, donationAmount } = req.body;
  try {
    const user = new User({ title, name, email, phone, address, city, state, paymentMethod, donationAmount, });
    if (req.file) {
      const imageurl = await uploadimage(req.file.path);
      user.image = imageurl;
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting the file:', unlinkError);
      }
    }
    // await user.save();
    res.status(200).json({
      success: true,
      message: 'User registered successfully',
      data: user
    });

    const htmlContent = `
    <div style="width: 600px; padding: 20px; background-color: #e6a15c; border: 2px solid #c0440d; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
            <!-- Add the logo here -->
            <img src="https://www.bajrangvahinidal.com/uploads/1698868863_4b65b39f091f43c03be2.png" alt="बजरंग वाहिनी दल Logo" style="width: 100px; height: auto; margin-bottom: 10px;">
            <h1 style="font-size: 28px; margin: 0; color: #d02626;">बजरंग वाहिनी दल</h1>
            <p style="font-size: 14px; color: #000;">226, शटर वाली गली, गाव डीआरैंपुर, नई दिल्ली - 110062 (भारत)</p>
        </div>
        <div style="margin-bottom: 15px;">
            <label style="font-size: 16px; color: #000;">श्री/श्रीमति:</label>
            <p style="font-size: 14px; padding: 8px; background-color: #fff; border-radius: 4px;">${name}</p>
        </div>
        <div style="margin-bottom: 15px;">
            <label style="font-size: 16px; color: #000;">पता:</label>
            <p style="font-size: 14px; padding: 8px; background-color: #fff; border-radius: 4px;">${address}</p>
        </div>
        <div style="margin-bottom: 15px;">
            <label style="font-size: 16px; color: #000;">दूरभाष:</label>
            <p style="font-size: 14px; padding: 8px; background-color: #fff; border-radius: 4px;">${phone}</p>
        </div>
        <div style="margin-bottom: 15px;">
            <label style="font-size: 16px; color: #000;">ई मेल:</label>
            <p style="font-size: 14px; padding: 8px; background-color: #fff; border-radius: 4px;">${email}</p>
        </div>
        <div style="margin-bottom: 15px;">
            <label style="font-size: 16px; color: #000;">माता/पिता का नाम:</label>
            <p style="font-size: 14px; padding: 8px; background-color: #fff; border-radius: 4px;">${name}</p>
        </div>
        <div style="margin-bottom: 15px;">
            <label style="font-size: 16px; color: #000;">राशि (शब्दों में):</label>
            <p style="font-size: 14px; padding: 8px; background-color: #fff; border-radius: 4px;">${donationAmount}</p>
        </div>
        <div style="margin-bottom: 15px;">
            <label style="font-size: 16px; color: #000;">नकद/ड्राफ्ट/डिजिटल/चेक नं:</label>
            <p style="font-size: 14px; padding: 8px; background-color: #fff; border-radius: 4px;">${paymentMethod}</p>
        </div>
        <div style="text-align: right; margin-top: 20px;">
            <!-- Add the signature image here -->
            <img src="https://www.bajrangvahinidal.com/uploads/1698868863_4b65b39f091f43c03be2.png" alt="Signature" style="width: 100px; height: auto; margin-bottom: 5px;">
            <p style="font-size: 18px; color: #000;">अधिकृत हस्ताक्षर</p>
        </div>
    </div>
`;


    // Convert HTML to PDF
    htmlToPdf.create(htmlContent).toBuffer(async (err, buffer) => {
      if (err) {
        return res.status(500).json({ message: 'Error generating PDF' });
      }
      await transporter.sendMail({
        from: 'mannu22072000@gmail.com',
        to: email,
        subject: 'Donate Successfully',
        text: 'Thank you for your donation!',
        attachments: [{
          filename: 'donation_receipt.pdf',
          content: buffer,
        }]
      });
      await transporter.sendMail({
        from: 'mannu22072000@gmail.com',
        to: "mannu22072000@gmail.com",
        subject: 'Donation Received',
        text: 'A donation has been made.',
        attachments: [{
          filename: 'donation_receipt.pdf',
          content: buffer,
        }]
      });
    });

  } catch (err) {
    console.log(err);
    if (err.name === 'MongoError' && err.code === 11000) {
      res.status(400).json({ message: 'Email or phone already exists' });
    } else {
      res.status(500).json({ message: 'Error registering user' });
    }
  }
};

