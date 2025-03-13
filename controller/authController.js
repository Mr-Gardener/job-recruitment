const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { validationResult } = require('express-validator');


// Register a new user
const registerUser = async (req, res) => {
    console.log("📝 Register Route Hit!");

    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        // Hash password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ name, email, password: hashedPassword, role });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Login a user
const loginUser = async (req, res) => {
    console.log("🚀 Login Route Hit!");

    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid emails' });

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

        // Generate JWT token
        // console.log("🔑📌 Signing Token with Secret:", process.env.JWT_SECRET);
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: "JWT Secret is missing!" });
        }

        const token = jwt.sign(
            { user: { id: user._id, role: user.role } },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, user });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    console.log("✏️ Update Profile Route Hit!");

    try {
        const userId = req.user.id;
        const { name, email, role } = req.body;

        // Find the user and update their details
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, email, role },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate a new token with updated user data
        const token = jwt.sign({ id: updatedUser._id, email: updatedUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' });


        res.status(200).json({ message: "Profile updated successfully", updatedUser });

    } catch (error) {
        console.error("Update profile error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};


module.exports = { registerUser, loginUser, updateProfile };
