const nodemailer = require('nodemailer');
const { generatePDF } = require("../Pdf/GenratePdf"); // Adjust this path
const fs = require('fs');

async function sendEmailWithPDF(details) {
    // Generate the PDF
    const pdfPath = generatePDF(details);

    // Set up the email transport using Nodemailer
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'mannu22072000@gmail.com',
            pass: 'zmkm jaky wltr tlhp'
        }
    });

    // Set up the email options
    let mailOptions = {
        from: 'your-email@gmail.com',
        to: details.email,
        subject: 'Your Donation Receipt',
        text: `Dear ${details.name},\n\nThank you for your donation! Please find your receipt attached.`,
        attachments: [
            {
                filename: 'dynamic_receipt.pdf',
                path: pdfPath,
                contentType: 'application/pdf'
            }
        ]
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log('Error while sending email:', error);
        }
        console.log('Email sent: ' + info.response);

        // Clean up: delete the generated PDF after sending the email
        fs.unlink(pdfPath, (err) => {
            if (err) {
                console.error('Error deleting the PDF file:', err);
            } else {
                console.log('PDF file deleted after sending email.');
            }
        });
    });
}

// Example usage
// sendEmailWithPDF({
//     name: 'John Doe',
//     address: '123 Main St, Springfield, USA',
//     phone: '1234567890',
//     email: 'john.doe@example.com',
//     parentName: 'Jane Doe',
//     amountInWords: 'One Hundred Dollars',
//     paymentMethod: 'Cash'
// });


module.exports = {
    sendEmailWithPDF
}