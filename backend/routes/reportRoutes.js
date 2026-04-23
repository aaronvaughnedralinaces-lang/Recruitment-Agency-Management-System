const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const reportController = require('../controllers/reportController');
const router = express.Router();

// Generate new report
router.post('/generate', authenticateToken, reportController.generateReport);

// Get user's/company's reports
router.get('/', authenticateToken, reportController.getReports);

// Download report
router.get('/:id/download', authenticateToken, reportController.downloadReport);

// Delete report
router.delete('/:id', authenticateToken, reportController.deleteReport);

// Schedule periodic report
router.post('/schedule', authenticateToken, reportController.scheduleReport);

module.exports = router;
