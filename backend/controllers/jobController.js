const Job = require('../models/Job');
const Company = require('../models/Company');
const User = require('../models/User');

exports.getJobs = async (req, res) => {
    try {
        const company = await Company.findByUserId(req.user.id);
        
        // Employer → return their own jobs
        if (company) {
            const jobs = await Job.findByCompanyId(company.id);
            return res.json(jobs);
        }
        
        // Job seeker → return all open jobs with filtering
        const { limit = 12, sort = 'posted_date,desc', status = 'open' } = req.query;
        
        // Parse sort parameter (e.g., "posted_date,desc")
        let [sortField, sortOrder] = sort.split(',');
        sortOrder = sortOrder ? sortOrder.toUpperCase() : 'DESC';
        const allowedFields = ['posted_date', 'title', 'salary_range', 'id'];
        if (!allowedFields.includes(sortField)) sortField = 'posted_date';
        if (!['ASC', 'DESC'].includes(sortOrder)) sortOrder = 'DESC';
        
        const jobs = await Job.getAllOpen({
            limit: Math.min(parseInt(limit) || 12, 100),
            sortField,
            sortOrder,
            status
        });
        res.json(jobs);
    } catch (err) {
        const errorCode = err.code || err.errno || 'UNKNOWN';
        const isConnError = ['ECONNREFUSED', 'ENOTFOUND', 'EHOSTUNREACH', 'ETIMEDOUT'].includes(errorCode);
        const statusCode = isConnError ? 503 : 500;
        
        let errorMsg = err.message;
        if (errorCode === 'ECONNREFUSED') {
            errorMsg = 'Database host refused connection. Check DB_HOST, DB_USER, DB_PASSWORD environment variables.';
        }
        
        console.error('getJobs error:', { code: errorCode, message: err.message, statusCode });
        res.status(statusCode).json({ 
            message: isConnError ? 'Database connection error' : 'Server error',
            details: process.env.NODE_ENV === 'development' ? errorMsg : undefined 
        });
    }
};

exports.createJob = async (req, res) => {
    const { title, description, salary_range, location, tags } = req.body; // <-- change salary to salary_range
    if (!title || !description || !salary_range || !location) {             // <-- use salary_range
        return res.status(400).json({ message: 'All fields are required' });
    }
    try {
        const company = await Company.findByUserId(req.user.id);
        if (!company) {
            return res.status(400).json({ message: 'No company associated with your account.' });
        }
        if (company.verified_status !== 'verified') {
            return res.status(403).json({ message: 'Your company must be verified before posting jobs.' });
        }

        const jobData = {
            company_id: company.id,
            title,
            description,
            location,
            salary_range,              // <-- use salary_range directly
            status: 'open',
            created_by: req.user.id
        };
        const newJob = await Job.create(jobData, tags || []);
        res.status(201).json(newJob);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteJob = async (req, res) => {
    try {
        const company = await Company.findByUserId(req.user.id);
        if (!company) {
            return res.status(403).json({ message: 'No company associated.' });
        }
        const affected = await Job.delete(req.params.id, company.id);
        if (affected === 0) return res.status(404).json({ message: 'Job not found or not authorized' });
        res.json({ message: 'Job deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateJob = async (req, res) => {
    const { title, description, salary_range, location, tags } = req.body;

    if (!title || !description || !salary_range || !location) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const company = await Company.findByUserId(req.user.id);
        if (!company) {
            return res.status(400).json({ message: 'No company associated with your account.' });
        }

        const jobId = req.params.id;
        const updatedJob = await Job.update(jobId, company.id, {
            title,
            description,
            location,
            salary_range,
        }, tags);

        if (!updatedJob) {
            return res.status(404).json({ message: 'Job not found or not authorized.' });
        }

        res.json(updatedJob);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};