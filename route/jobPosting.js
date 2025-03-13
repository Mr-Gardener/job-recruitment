const express = require("express");
const { addJob, getJobs } = require('../controller/jobController'); // Import addJob function
const Job = require("../models/Job");
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
  next(); // This allows the request to continue to the next middleware/handler
});
  
// Add logging inside the authMiddleware
router.use((req, res, next) => {
  const token = req.headers['authorization'];
  console.log('🔑 Received Token:', token);

  if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ message: 'No token provided' });
  }
  next();
});

// Route to add a job
router.post('/jobs', authMiddleware, (req, res) => {
  console.log('📩 POST request to /jobs');
  console.log('Request body:', req.body);
  console.log('User:', req.user); // Log user data to verify role

  if (req.user.role !== 'employer') {
      console.log('⛔ Access denied: Only employers can post jobs');
      return res.status(403).json({ message: 'Only employers can post jobs' });
  }

  const { title, company, location, salary, description, requirements, industry } = req.body;

  if (!title || !company || !location || !description) {
      console.log('⚠️ Missing fields in job data');
      return res.status(400).json({ message: 'All fields are required.' });
  }

  const newJob = new Job({ title, company, location, salary, description, requirements, industry });

  newJob.save()
      .then(() => {
          console.log('✅ Job posted successfully');
          res.status(201).json({ message: 'Job posted successfully' });
      })
      .catch((error) => {
          console.error('❗ Failed to post job:', error);
          res.status(500).json({ message: 'Failed to post job', error });
      });
});


// Route to get all jobs
router.get('/jobs', async (req, res) => {
    try {
      const jobs = await Job.find();
      res.json(jobs);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      res.status(500).json({ message: 'Failed to fetch jobs' });
    }
  });
  

  
  
//Route to search for job
router.get('/search', async (req, res) => {
  let { title, location, industry } = req.query; 

  // Trim whitespace to remove extra newline issues
  title = title ? title.trim() : null;
  location = location ? location.trim() : null;
  industry = industry ? industry.trim() : null;

  try {
      const query = {}; 

      if (title) {
          query.title = { $regex: title, $options: 'i' };
      }
      if (location) {
          query.location = { $regex: location, $options: 'i' };
      }
      if (industry) {
          query.industry = { $regex: industry, $options: 'i' };
      }

      console.log("🔍 Searching with query:", query); // Log the fixed query to terminal

      const jobs = await Job.find(query); 

      if (jobs.length === 0) {
          return res.status(404).json({ message: 'No jobs found matching the criteria.' });
      }

      res.status(200).json(jobs);
  } catch (err) {
      console.error("🔥 ERROR in Job Search API:", err); 
      res.status(500).json({ message: 'Error searching for jobs' });
  }
});



module.exports = router;
