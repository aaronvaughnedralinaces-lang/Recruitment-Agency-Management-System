const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getJobs, createJob, deleteJob, updateJob } = require('../controllers/jobController');

const router = express.Router();

router.get('/', authenticateToken, getJobs);
router.post('/', authenticateToken, createJob);
router.put('/:id', authenticateToken, updateJob);
router.delete('/:id', authenticateToken, deleteJob);

module.exports = router;