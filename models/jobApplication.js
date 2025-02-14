const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true }, // Reference to the Job
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true},
  applicantName: { type: String, required: true},
  email: { type: String, required: true, match: [/.+\@.+\..+/, 'Please enter a valid email'] },   //  Email validation
  resume: { type: String, required: true },  // URL or path to the resume
  coverLetter: { type: String },
  status: { type: String, enum: ['pending', 'reviewed', 'accepted', 'rejected'], default: 'pending' } 
}, { timestamps: true });


//compound index for jobId and userId for fast searches
jobApplicationSchema.index({ jobId: 1, userId: 1 });


module.exports = mongoose.model('JobApplication', jobApplicationSchema);
