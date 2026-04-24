const Company = require('../models/Company');
const User = require('../models/User');
const Job = require('../models/Job');
const db = require('../config/database'); // for activity logs
const Document = require('../models/Document');

exports.getCompanies = async (req, res) => {
    try {
        // Your logic to fetch companies from the database
        const companies = await Company.getAll(); // or whatever query
        res.json(companies);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateCompanyVerification = async (req, res) => {
    const { verified_status } = req.body;
    if (!verified_status || !['verified', 'unverified'].includes(verified_status)) {
        return res.status(400).json({ message: 'Invalid status. Must be "verified" or "unverified".' });
    }
    try {
        const company = await Company.findById(req.params.id);
        if (!company) return res.status(404).json({ message: 'Company not found' });
        await Company.updateVerificationStatus(req.params.id, verified_status);
        res.json({ message: 'Company verification status updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.getAllUsers();
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getJobs = async (req, res) => {
    try {
        const jobs = await Job.getAll();
        res.json(jobs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getActivityLogs = async (req, res) => {
    try {
        const [logs] = await db.query(`
            SELECT id, user_id, action, entity_type, entity_id, details, 
                   ip_address, user_agent, created_at
            FROM activity_logs
            ORDER BY created_at DESC
            LIMIT 500
        `);
        res.json(logs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getCompanyDocuments = async (req, res) => {
    try {
        const companyId = req.params.id;
        const docs = await Document.getByCompanyId(companyId);
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

exports.updateDocumentStatus = async (req, res) => {
    const { status } = req.body;
    const docId = req.params.id;
    if (!['valid', 'expired', 'pending'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Use valid, expired, or pending.' });
    }
    try {
        await Document.updateStatus(docId, status);
        res.json({ message: 'Document status updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Public endpoint - get all verified companies for job seekers
exports.getPublicCompanies = async (req, res) => {
    try {
        const companies = await Company.getAll();
        // Return only verified companies with essential info
        const publicCompanies = companies.map(c => ({
            id: c.id,
            name: c.name,
            description: c.description,
            location: c.location,
            website: c.website,
            contact_email: c.contact_email,
            contact_phone: c.contact_phone,
            logo: c.logo,
            verified_status: c.verified_status
        }));
        res.json(publicCompanies);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

