const JobApplication = require('../models/jobApplication');
const Job = require('../models/Job');


const getPublicJobListings = async (req, res) => {
  try {
    const jobs = await Job.find({}, 'title company location description');
    res.status(200).json(jobs);
  } catch (err) {
    console.error('Error fetching job listings:', err);
    res.status(500).json({ message: 'Failed to fetch job listings', error: err.message });
  }
};

const applyForJob = async (req, res) => {
  try {
    // Extract form fields from the request
    const { jobId, applicantName, email, coverLetter } = req.body;
    const userId = req.user.id;

    // Handle file upload (from multer)
    const resumeFile = req.file;

    if (!jobId || !applicantName || !email || !resumeFile) {
      return res.status(400).json({ message: 'jobId, applicantName, email, and resume are required.' });
    }

    // Prevent duplicate applications
    const existingApplication = await JobApplication.findOne({ jobId, userId });
    if (existingApplication) {
      return res.status(409).json({ message: 'You have already applied for this job.' });
    }

    // Trim inputs and normalize email
    const cleanedEmail = email.trim().toLowerCase();
    const sanitizedName = applicantName.trim();

    const newApplication = new JobApplication({
      jobId,
      userId,
      applicantName: sanitizedName,
      email: cleanedEmail,
      resume: resumeFile.path, // Save file path or URL
      coverLetter
    });

    await newApplication.save();
    res.status(201).json({ message: 'Application submitted successfully.', application: newApplication });
  } catch (err) {
    console.error('Error applying for job:', err);
    res.status(500).json({ message: 'Failed to apply for job.', error: err.message });
  }
};



// Update job application status to either 'pending', 'reviewed', 'accepted', 'rejected'
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status values
    const validStatuses = ['pending', 'reviewed', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const application = await JobApplication.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json({ message: "Application status updated successfully", application });
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({ message: "Error updating application status", error: error.message });
  }
};


// 📜 Get all job applications (Admin or Employer)
const getAllApplications = async (req, res) => {
  try {
    const user = req.user;
    if (!user || (user.role !== 'employer' && user.role !== 'admin')) {
      return res.status(403).json({ message: "Access denied. Only employers or admins can view applications." });
    }

    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const applications = await JobApplication.find()
      .populate('jobId', 'title')
      .populate('userId', 'name email')
      .select('-__v') // Exclude MongoDB version key
      .skip(skip)
      .limit(limit);

    const totalApplications = await JobApplication.countDocuments();

    res.json({
      applications,
      page,
      totalPages: Math.ceil(totalApplications / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Get all job applications for a specific user
const getUserApplications = async (req, res) => {
  try {
    const userId = req.user.id;

    const applications = await JobApplication.find({ userId })
      .populate('jobId', 'title companyName')
      .select('jobId status createdAt updatedAt');

    if (!applications.length) {
      return res.status(404).json({ message: "No applications found for this user." });
    }

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Delete a job application
const deleteApplication = async (req, res) => {
  try {
    const applicationId = req.params.id;
    const userId = req.user.id;

    const application = await JobApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Job application not found." });
    }

    if (application.userId.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized to delete this application." });
    }

    // Soft delete approach (optional)
    // application.deleted = true;
    // await application.save();

    await application.deleteOne();
    res.json({ message: "Job application deleted successfully." });

  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};


module.exports = {
  getPublicJobListings,
  applyForJob,
  updateApplicationStatus, 
  getAllApplications,
  getUserApplications, 
  deleteApplication
};



