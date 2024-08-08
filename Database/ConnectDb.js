const mongoose = require("mongoose")

const connectdb = async()=>{
    try {
        await mongoose.connect("mongodb+srv://mannu22072000:ddcQ0VARz2v8VGVi@cluster0.s92yp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
        console.log("Database connected successfully")
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    connectdb
}