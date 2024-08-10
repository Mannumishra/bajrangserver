const cloudnary = require("cloudinary").v2

cloudnary.config({
    cloud_name: process.env.CLOUD_NAME || "dsimn9z1r",
    api_key: process.env.API_KEY || "998919427255124",
    api_secret: process.env.API_SEC || "h-PsVovtSvzakWubj1X8sXJEtp4"
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