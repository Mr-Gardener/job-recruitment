const Job = require('../controller/jobApplicationController');

const addJob = async (req, res) => {
    console.log('Request received to add a job'); // Debugging message

    const { title, company, location, salary, description, requirements, industry } = req.body;

    // Validate the required fields
    if (!title || !company || !location || !salary || !description || !requirements || !industry) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const newJob = new Job({ title, company, location, salary, description, requirements, industry });
        await newJob.save();
        console.log('Job saved to database');
        res.status(201).json(newJob); // Send the new job back as a response
    } catch (err) {
        console.error('Error adding job:', err); // Log any errors
        res.status(500).json({ message: 'Failed to add job' });
    }
};

module.exports = { addJob };
