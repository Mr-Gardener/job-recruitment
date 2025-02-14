const JobApplication = require('../models/jobApplication');

const applyForJob = async (req, res) => {
   try { 
  const { jobId, applicantName, email, resume, coverLetter } = req.body;
  const userId = req.user.id; // Get userId from authenticated request

  // Basic validation 
  if (!jobId || !applicantName || !email || !resume) {
    return res.status(400).json({ message: 'jobId, applicantName, email, and resume are required.' });
  }

  
    const newApplication = new JobApplication({
      jobId,
      userId,
      applicantName,
      email,
      resume,
      coverLetter
    });

    await newApplication.save();
    res.status(201).json({ message: 'Application submitted successfully.', application: newApplication });
  } catch (err) {
    console.error('Error applying for job:', err);
    res.status(500).json({ message: 'Failed to apply for job.' });
  }
};


// Update job application status
const updateApplicationStatus = async (req, res) => {
  try {
      const { id } = req.params; // Get application ID from request URL
      const { status } = req.body; // Get new status from request body

      // Find the job application by ID and update the status
      const application = await JobApplication.findByIdAndUpdate(
          id,
          { status },
          { new: true } // Return the updated document
      );

      if (!application) {
          return res.status(404).json({ message: "Application not found" });
      }

      res.status(200).json({ message: "Application status updated successfully", application });
  } catch (error) {
      console.error("Error updating application status:", error);
      res.status(500).json({ message: "Error updating application status", error });
  }
};

// 📜 Get all job applications (Admin or Employer)
const getAllApplications = async (req, res) => {
  try {
      const user = req.user; // Extracted from authMiddleware

      // Check if the user is an employer or admin
      if (user.role !== 'employer' && user.role !== 'admin') {
          return res.status(403).json({ message: "Access denied. Only employers or admins can view applications." });
      }

      const applications = await JobApplication.find().populate('jobId userId', 'title name email');
      res.json({ applications });
  } catch (error) {
      res.status(500).json({ message: "Server error" });
  }
};

// Get all job applications for a specific user
const getUserApplications = async (req, res) => {
  try {
      const userId = req.user.id; // Extract user ID from the token

      const applications = await JobApplication.find({ userId });

      if (!applications.length) {
          return res.status(404).json({ message: "No applications found for this user." });
      }

      res.json(applications);
  } catch (error) {
      res.status(500).json({ message: "Server error" });
  }
};

// Delete a job application
const deleteApplication = async (req, res) => {
  try {
      const applicationId = req.params.id;
      const userId = req.user.id; // Extracted from the token

      const application = await JobApplication.findById(applicationId);
      if (!application) {
          return res.status(404).json({ message: "Job application not found." });
      }

      // Only the applicant or an admin can delete the application
      if (application.userId.toString() !== userId && req.user.role !== "admin") {
          return res.status(403).json({ message: "Unauthorized to delete this application." });
      }

      await application.deleteOne();
      res.json({ message: "Job application deleted successfully." });

  } catch (error) {
      res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  applyForJob,
  updateApplicationStatus, 
  getAllApplications,
  getUserApplications, 
  deleteApplication
};