const express = require('express');
const { sendOtp, verifyOtp, signup, verifyPayment } = require('../Controllar/SignupControllar');

const multer = require("multer")
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './Public/Images')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname)
    }
})

const upload = multer({ storage: storage })

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/signup',upload.single("image"), signup);
router.post('/payment-verification', verifyPayment);

module.exports = router;
