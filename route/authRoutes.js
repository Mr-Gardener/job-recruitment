const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/user');
const { authMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();
const { registerUser, loginUser, updateProfile } = require('../controller/authController');
const multer = require('multer');

//register user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    console.log('Incoming registration request:', req.body);

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Create new user
    const newUser = new User({ name, email, password, role });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// ✅ Login User
router.post('/login', [
  check('email', 'Valid email is required').isEmail(),
  check('password', 'Password is required').exists()
], loginUser); // Call loginUser from authController

// Handle file uploads (for profile pictures)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Update Profile Route
// router.put('/edit-profile', authMiddleware, upload.single('profilePicture'), updateProfile);

// router.put('/profile', async (req, res) => {
//   try {
//     const { name, bio, skills } = req.body;
//     const userId = req.user.id;

//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { name, bio, skills },
//       { new: true }
//     );

//     if (updatedUser) {
//       res.json(updatedUser);
//     } else {
//       res.status(404).json({ message: 'User not found' });
//     }
//   } catch (error) {
//     console.error('Profile update error:', error);
//     res.status(500).json({ message: 'Failed to update profile' });
//   }
// });

// Get User Profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // Exclude the password
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user); // Return the user data
  } catch (error) {
    console.error('Failed to load user profile:', error);
    res.status(500).json({ message: 'Failed to load user profile' });
  }
});


router.get('/jobs/:id', async (req, res) => {
  const { id } = req.params;
  const job = await Job.findById(id);
  
  if (!job) return res.status(404).json({ message: 'Job not found' });
  
  res.json(job);
});



module.exports = router;