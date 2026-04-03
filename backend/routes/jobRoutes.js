const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getJobs, createJob, deleteJob, updateJob } = require('../controllers/jobController');

const router = express.Router();

router.get('/jobs', authenticateToken, getJobs);
router.post('/jobs', authenticateToken, createJob);
router.put('/jobs/:id', authenticateToken, updateJob);
router.delete('/jobs/:id', authenticateToken, deleteJob);

module.exports = router;