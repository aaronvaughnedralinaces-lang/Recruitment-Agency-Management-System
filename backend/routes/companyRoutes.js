const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const logoUpload = require('../middleware/logoUpload'); // multer for logo images
const {
    getCompany,
    createCompany,
    updateCompany,
    uploadDocument,
    getDocuments
} = require('../controllers/companyController');

const router = express.Router();

// Company profile routes with logo upload support
router.get('/company', authenticateToken, getCompany);
router.post('/company', authenticateToken, logoUpload.single('logo'), createCompany);
router.put('/company', authenticateToken, logoUpload.single('logo'), updateCompany);

// Document routes (unchanged)
router.post('/company/documents', authenticateToken, uploadDocument);
router.get('/company/documents', authenticateToken, getDocuments);

module.exports = router;