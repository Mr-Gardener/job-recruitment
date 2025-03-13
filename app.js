const express = require('express');
const dotenv = require('dotenv');
const jobRoutes = require("./route/jobPosting");
const authRoutes = require('./route/authRoutes');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); 
const applicationRoutes = require('./route/jobApplicationRoute');  
const helmet = require("helmet");
const uploadRoutes = require("./route/uploadRoute");



// Initialize dotenv to load environment variables
dotenv.config();
console.log("Loaded JWT_SECRET from .env:", process.env.JWT_SECRET); // Debugging step

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// A simple route
app.get('/', (req, res) => {
  res.send('Welcome to the Job Recruitment Platform API');
});

const connectDB = require("./config/db");

connectDB(); // Call the function to connect to MongoDB

// Set the server to listen on a port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



app.use(helmet());
app.use(cors({ origin: "*", credentials: true }));


app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

//routes
app.use("/api/jobs", jobRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes); // Applications endpoint
app.use('/api/job-applications', applicationRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api", jobRoutes);


// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/job-recruitment', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error: ', err));