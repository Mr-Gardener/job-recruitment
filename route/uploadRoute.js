const express = require("express");
const { upload } = require("../config/cloudinary");
const {authMiddleware} = require("../middleware/authMiddleware");

const router = express.Router();

// 📤 Upload Profile Picture (Authenticated Users)
router.post("/upload", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    res.json({
      message: "File uploaded successfully",
      imageUrl: req.file.path, // Cloudinary URL
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
