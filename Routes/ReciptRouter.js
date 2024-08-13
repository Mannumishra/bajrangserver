const { gentrateSlip } = require("../Controllar/ReciptControllar")

const slipRouter = require("express").Router()
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

slipRouter.post("/send-receipt",upload.single("file") , gentrateSlip)

module.exports = slipRouter