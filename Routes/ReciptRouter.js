const express = require("express");
const multer = require("multer");
const path = require("path");
const { gentrateSlip } = require("../Controllar/ReciptControllar");

const slipRouter = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../Public/Images'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

slipRouter.post("/send-receipt", upload.single("file"), gentrateSlip);

module.exports = slipRouter;
