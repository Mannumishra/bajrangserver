const cloudnary = require("cloudinary").v2

cloudnary.config({
    cloud_name:"dsimn9z1r",
    api_key:"998919427255124",
    api_secret:"h-PsVovtSvzakWubj1X8sXJEtp4"
})

const uploadimage = async(file)=>{
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