const cloudnary = require("cloudinary").v2

cloudnary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SEC
})

const uploadimage = async (file) => {
    try {
        const imgurl = await cloudnary.uploader.upload(file)
        return imgurl.secure_url
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    uploadimage
}