const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/user');

const router = express.Router();
const { registerUser, loginUser } = require('../controller/authController');

// ✅ Register User
router.post('/register', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Valid email is required').isEmail(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
], registerUser); // Call registerUser from authController

// ✅ Login User
router.post('/login', [
  check('email', 'Valid email is required').isEmail(),
  check('password', 'Password is required').exists()
], loginUser); // Call loginUser from authController

module.exports = router;