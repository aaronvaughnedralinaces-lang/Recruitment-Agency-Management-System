/*const express = require('express');
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

module.exports = router;*/


const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const logoUpload = require('../middleware/logoUpload'); 
const {
    getCompany,
    createCompany,
    updateCompany,
    uploadDocument,
    getDocuments
} = require('../controllers/companyController');

const router = express.Router();

// Company profile routes
// Using '/' here combines with '/api/company' from apps.js to make '/api/company'
router.get('/', authenticateToken, getCompany);
router.post('/', authenticateToken, logoUpload.single('logo'), createCompany);
router.put('/', authenticateToken, logoUpload.single('logo'), updateCompany);

// Document routes
// Using '/documents' here combines to make '/api/company/documents'
router.post('/documents', authenticateToken, uploadDocument);
router.get('/documents', authenticateToken, getDocuments);

module.exports = router;