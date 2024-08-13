const recipt = require("../Model/ReciptModel");
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs'); // Import fs module

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
        user: process.env.EMAIL_SEND || "bajrangvahinidal@gmail.com",
        pass: process.env.EMAIL_PASS || "uyow ripi dqpz jcjp",
    }
});

const gentrateSlip = async (req, res) => {
    try {
        const { email } = req.body;
        if (req.file) {
            const receiptPath = path.join(__dirname, "../Public/Images", req.file.filename);
            console.log("Saving file to:", receiptPath);
            const data = new recipt({
                email: email,
                file: `/Public/Images/${req.file.filename}`  
            });
            await data.save();
            const mailOptions = {
                from: process.env.EMAIL_SEND || "bajrangvahinidal@gmail.com",
                to: email,
                subject: 'Your Donation Receipt',
                text: 'Please find attached your donation receipt.',
                attachments: [
                    {
                        filename: 'receipt.pdf',
                        path: receiptPath
                    }
                ]
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    return res.status(500).json({ message: "Error sending email" });
                } else {
                    console.log('Email sent: ' + info.response);

                    // Delete the file after sending the email
                    fs.unlink(receiptPath, (err) => {
                        if (err) {
                            console.error('Error deleting the file:', err);
                        } else {
                            console.log('File deleted successfully');
                        }
                    });

                    return res.status(200).json({ message: "Receipt sent successfully" });
                }
            });
        } else {
            return res.status(400).json({ message: "No file attached" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    gentrateSlip
};
