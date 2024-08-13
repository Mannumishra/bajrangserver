const mongoose = require("mongoose")

const reciptScema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    file: {
        type: String,
        required: true
    }
})

const recipt = mongoose.model("Recipt", reciptScema)

module.exports = recipt