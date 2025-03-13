const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['jobSeeker', 'employer', 'admin'], default: 'jobSeeker' }, // Role-based access
  bio: { type: String },                         // Add bio field
  skills: { type: [String] },                   // Add skills field (array of strings)
  profilePicture: { type: String },             // Add profile picture field (URL or base64)
  profileComplete: { type: Boolean, default: false } // Track profile completeness
});


// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;



