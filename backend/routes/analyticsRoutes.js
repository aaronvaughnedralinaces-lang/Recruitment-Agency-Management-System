const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');
const router = express.Router();

// Get recruitment metrics
router.get('/metrics', authenticateToken, analyticsController.getMetrics);

// Get trends data
router.get('/trends', authenticateToken, analyticsController.getTrends);

// Get job performance data
router.get('/job-performance', authenticateToken, analyticsController.getJobPerformance);

module.exports = router;
