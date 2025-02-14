const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  salary: { type: String, required: true },
  description: { type: String, required: true },
  requirements: { type: [String], required: true },
  industry: { type: String, required: true },
}, { timestamps: true });  // Optionally, add createdAt and updatedAt timestamps

// Create the Job model based on the schema
const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
