const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
    getCompanies,
    updateCompanyVerification,
    getUsers,
    getJobs,
    getActivityLogs,
    getCompanyDocuments,    // <-- ensure imported
    updateDocumentStatus    // <-- ensure imported
} = require('../controllers/adminController');

const router = express.Router();

router.get('/companies', authenticateToken, requireAdmin, getCompanies);
router.put('/companies/:id', authenticateToken, requireAdmin, updateCompanyVerification);

router.get('/users', authenticateToken, requireAdmin, getUsers);
router.get('/jobs', authenticateToken, requireAdmin, getJobs);
router.get('/activity-logs', authenticateToken, requireAdmin, getActivityLogs);
router.get('/companies/:id/documents', authenticateToken, requireAdmin, getCompanyDocuments);
router.put('/documents/:id', authenticateToken, requireAdmin, updateDocumentStatus);
module.exports = router;