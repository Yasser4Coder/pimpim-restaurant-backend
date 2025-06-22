const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// 🔐 Your Cloudinary credentials (use .env for security)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Storage Engine for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "resturant", // Folder name in your Cloudinary dashboard
  },
});

module.exports = {
  cloudinary,
  storage,
};
