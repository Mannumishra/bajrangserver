const express = require('express');
const { sendOtp, verifyOtp, signup, paymentVerification, getRecord, getSingleRecord } = require('../Controllar/SignupControllar');

const multer = require("multer")
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = './Public/Images';
        // Create directory if it doesn't exist
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});


const upload = multer({ storage: storage })

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/signup', upload.fields([
    { name: "image", maxCount: 1 },
    { name: "adharcardFront", maxCount: 1 },
    { name: "adharcardBack", maxCount: 1 },
]), signup);
router.post('/payment-verification', paymentVerification);
router.get('/signup', getRecord);
router.get('/signup/:_id', getSingleRecord);

module.exports = router;
