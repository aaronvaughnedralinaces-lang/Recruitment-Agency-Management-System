const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const applicationController = require('../controllers/applicationController');
const applicationUpload = require('../middleware/applicationUpload');
const router = express.Router();

// Get user's applications
router.get('/my-applications', authenticateToken, applicationController.getMyApplications);

// Submit new application
router.post('/apply', authenticateToken, applicationUpload.array('documents', 8), applicationController.submitApplication);

// Get specific application
router.get('/:id', authenticateToken, applicationController.getApplication);

// Update application status
router.patch('/:id/status', authenticateToken, applicationController.updateApplicationStatus);

// Delete application
router.delete('/:id', authenticateToken, applicationController.deleteApplication);

module.exports = router;
