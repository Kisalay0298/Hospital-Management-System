import { v2 as cloudinary } from 'cloudinary'

const connectCloudinary = async () => {
    cloudinary.config ({
        cloud_name: process.env.cloudinary_Name,
        api_key: process.env.cloudinary_API_Key,
        api_secret: process.env.cloudinary_API_Secret,
    })
}

export default connectCloudinary