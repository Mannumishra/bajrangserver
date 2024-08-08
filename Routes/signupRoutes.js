const express = require('express');
const { sendOtp, verifyOtp, signup } = require('../Controllar/SignupControllar');


const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/signup', signup);

module.exports = router;
