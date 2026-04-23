const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const interviewController = require('../controllers/interviewController');
const router = express.Router();

// Get user's interviews
router.get('/', authenticateToken, interviewController.getInterviews);

// Schedule new interview
router.post('/', authenticateToken, interviewController.scheduleInterview);

// Update interview
router.patch('/:id', authenticateToken, interviewController.updateInterview);

// Add feedback to interview
router.post('/:id/feedback', authenticateToken, interviewController.addFeedback);

// Cancel interview
router.delete('/:id', authenticateToken, interviewController.cancelInterview);

module.exports = router;
