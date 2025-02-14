const express = require("express");
const { addJob } = require('../controller/jobController'); // Import addJob function
const Job = require("../models/Job");

const router = express.Router();

router.use((req, res, next) => {
  console.log(`${req.method} request made to: ${req.url}`);
  next(); // This allows the request to continue to the next middleware/handler
});
  

  // Route to add a job
router.post('/', addJob);
  
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
