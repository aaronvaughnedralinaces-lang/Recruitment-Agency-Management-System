const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getJobs, createJob, deleteJob, updateJob } = require('../controllers/jobController');

// IMPORT THE APPLICATION CONTROLLER HERE
const applicationController = require('../controllers/applicationController');

const router = express.Router();

router.get('/', authenticateToken, getJobs);
router.post('/', authenticateToken, createJob);
router.put('/:id', authenticateToken, updateJob);
router.delete('/:id', authenticateToken, deleteJob);

// NEW ROUTE: Fetch applicants for a specific job (Protected by authentication)
router.get('/:id/applications', authenticateToken, applicationController.getJobApplications);

module.exports = router;