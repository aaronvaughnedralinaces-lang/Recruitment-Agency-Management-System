const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const screeningController = require('../controllers/screeningController');
const router = express.Router();

// Get all candidates for screening
router.get('/candidates', authenticateToken, screeningController.getCandidates);

// Update candidate screening score
router.patch('/candidates/:id', authenticateToken, screeningController.updateCandidateScore);

// Get recommended candidates
router.get('/recommended', authenticateToken, screeningController.getRecommendedCandidates);

// Bulk update candidates
router.post('/bulk-update', authenticateToken, screeningController.bulkScreenCandidates);

// Get screening summary
router.get('/summary', authenticateToken, screeningController.getScreeningSummary);

module.exports = router;
