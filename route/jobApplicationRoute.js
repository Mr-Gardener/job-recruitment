const express = require('express');
const router = express.Router();
const multer = require('multer');
const {authMiddleware} = require('../middleware/authMiddleware');
const { 
    applyForJob, 
    updateApplicationStatus, 
    getAllApplications, 
    getUserApplications, 
    deleteApplication
} = require('../controller/jobApplicationController');
console.log({ getAllApplications });

// Configure file storage for resumes
const storage = multer.diskStorage({
    destination: './uploads/', // Save resumes in "uploads" folder
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  
  const upload = multer({ storage });

// Debugging middleware
router.use((req, res, next) => {
    console.log(`📥 Job Application route received a ${req.method} request to ${req.url}`);
    next();
});

router.get("/protected-route", authMiddleware, (req, res) => {
    res.json({ message: "Access granted!" });
});


// Job application endpoint
router.post('/', authMiddleware, upload.single('resume'), applyForJob);

// Route for employers to update application status
router.patch('/:id', authMiddleware, updateApplicationStatus);

// 📜 Get all job applications (Admin or Employer)
router.get('/', authMiddleware, getAllApplications);

// Get applications for a specific user
router.get("/my-applications", authMiddleware, getUserApplications);

// DELETE application by ID (Only the applicant or an admin can delete)
router.delete("/:id", authMiddleware, deleteApplication);
  

module.exports = router;

