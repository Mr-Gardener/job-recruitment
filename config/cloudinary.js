const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

// 🔧 Configure Cloudinary with credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 📂 Configure Multer Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "job-recruitment", // Cloudinary folder name
    allowed_formats: ["jpg", "png", "jpeg", "pdf"], // Allowed file types
  },
});

// Initialize Multer with Cloudinary storage
const upload = multer({ storage });

module.exports = { cloudinary, upload };
