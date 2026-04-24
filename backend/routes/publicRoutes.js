const express = require('express');
const { getPublicCompanies } = require('../controllers/adminController');
const { getPublicJobById, getPublicJobs } = require('../controllers/jobController');

const router = express.Router();

// Public endpoints - no authentication required

// Get all companies (for job seeker company directory)
router.get('/companies', getPublicCompanies);

// Get all open jobs (for job seeker job listings)
router.get('/jobs', getPublicJobs);

// Get a specific job by ID (for job seeker apply page)
router.get('/jobs/:id', getPublicJobById);

module.exports = router;
