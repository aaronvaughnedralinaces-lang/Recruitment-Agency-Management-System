const fs = require('fs');
const path = require('path');
const Company = require('../models/Company');
const Document = require('../models/Document');
const User = require('../models/User');
const upload = require('../middleware/upload');

// Helper to delete old logo file
const deleteOldLogo = (logoPath) => {
    if (logoPath && logoPath.startsWith('uploads/company_logo/')) {
        const fullPath = path.join(__dirname, '..', logoPath);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }
};

// GET company
exports.getCompany = async (req, res) => {
    try {
        const company = await Company.findByUserId(req.user.id);
        if (!company) return res.status(404).json({ message: 'Company not found' });
        // Ensure logo URL is relative (frontend will prepend API_URL)
        if (company.logo && !company.logo.startsWith('data:') && !company.logo.startsWith('http')) {
            company.logo = company.logo.replace(/\\/g, '/');
        }
        res.json(company);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// CREATE company (with optional logo file)
exports.createCompany = async (req, res) => {
    let { name, description, location, website, contact_email, contact_phone } = req.body;
    let logo = req.body.logo; // could be base64 or relative path from file upload

    if (!name) return res.status(400).json({ message: 'Company name is required' });

    try {
        // Handle file upload for logo (if a file was sent)
        if (req.file) {
            const relativePath = `uploads/company_logo/${req.file.filename}`;
            logo = relativePath;
        }

        const existing = await Company.findByUserId(req.user.id);
        if (existing) return res.status(400).json({ message: 'User already has a company profile' });

        const companyId = await Company.create({ 
            name, description, logo, location, website, contact_email, contact_phone 
        });
        await User.updateCompanyId(req.user.id, companyId);

        const newCompany = await Company.findById(companyId);
        res.status(201).json(newCompany);
    } catch (err) {
        console.error(err);
        // If a file was uploaded but company creation failed, delete the file
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'Server error' });
    }
};

// UPDATE company (with optional logo file)
exports.updateCompany = async (req, res) => {
    let { name, description, location, website, contact_email, contact_phone } = req.body;
    let logo = req.body.logo;

    if (!name) return res.status(400).json({ message: 'Company name is required' });

    try {
        const company = await Company.findByUserId(req.user.id);
        if (!company) return res.status(404).json({ message: 'Company not found' });

        // Handle file upload for logo
        if (req.file) {
            // Delete old logo file if it exists and is a file path
            deleteOldLogo(company.logo);
            logo = `uploads/company_logo/${req.file.filename}`;
        }

        await Company.update(company.id, { 
            name, description, logo, location, website, contact_email, contact_phone 
        });

        res.json({ message: 'Company updated successfully' });
    } catch (err) {
        console.error(err);
        // If a file was uploaded but update failed, delete it
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'Server error' });
    }
};

// Upload document (unchanged)
exports.uploadDocument = async (req, res) => {
    upload.single('document')(req, res, async (err) => {
        if (err) {
            if (err.message) return res.status(400).json({ message: err.message });
            return res.status(500).json({ message: 'File upload failed' });
        }

        try {
            if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

            const { doc_type } = req.body;
            if (!['poea_license', 'business_permit', 'job_order'].includes(doc_type)) {
                fs.unlinkSync(req.file.path);
                return res.status(400).json({ message: 'Invalid document type' });
            }

            const company = await Company.findByUserId(req.user.id);
            const companyId = company ? company.id : null;
            const relativeFilePath = `uploads/company_documents/${req.file.filename}`;

            await Document.upsert(req.user.id, companyId, doc_type, relativeFilePath);

            res.json({ message: `${doc_type.replace('_', ' ')} uploaded successfully. Awaiting admin review.` });
        } catch (err) {
            console.error(err);
            if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            res.status(500).json({ message: 'Server error during upload' });
        }
    });
};

// Get documents (unchanged)
exports.getDocuments = async (req, res) => {
    try {
        const company = await Company.findByUserId(req.user.id);
        if (!company) return res.json([]);

        const docs = await Document.findByCompanyId(company.id);
        const docsWithUrl = docs.map(doc => ({
            ...doc,
            file_url: `/${doc.file_path.replace(/\\/g, '/')}`
        }));
        res.json(docsWithUrl);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};