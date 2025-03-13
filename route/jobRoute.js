const express = require('express');
const router = express.Router();
const { getJobs, addJob } = require('../controller/jobController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Public route to fetch all job listings (no token required)
router.get('/', getJobs);

// Protected route to add a new job (only for employers/admins)
router.post('/', authMiddleware, addJob);

module.exports = router;

