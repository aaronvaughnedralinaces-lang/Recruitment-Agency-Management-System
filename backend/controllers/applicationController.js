const db = require('../config/database');
const path = require('path');
const fs = require('fs');

// Get user's applications
exports.getMyApplications = async (req, res) => {
    try {
        const userId = req.user.id;

        // FIX: Increase the GROUP_CONCAT limit so the JSON string doesn't get cut off!
        await db.query('SET SESSION group_concat_max_len = 1000000;');

        const query = `
            SELECT 
                a.*,
                j.title as job_title,
                j.description,
                c.name as company_name,
                c.logo as company_logo,
                GROUP_CONCAT(
                    JSON_OBJECT(
                        'id', d.id,
                        'application_id', d.application_id,
                        'document_type', d.document_type,
                        'file_path', d.file_path,
                        'original_filename', d.original_filename,
                        'mime_type', d.mime_type,
                        'uploaded_at', d.uploaded_at
                    )
                ) as documents
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            JOIN companies c ON j.company_id = c.id
            LEFT JOIN documents d ON a.id = d.application_id
            WHERE a.user_id = ?
            GROUP BY a.id
            ORDER BY a.submitted_at DESC
        `;
        
        const [applications] = await db.query(query, [userId]);
        
        // Parse documents JSON
        const parsed = applications.map(app => ({
            ...app,
            documents: app.documents ? JSON.parse(`[${app.documents}]`) : []
        }));
        
        res.json(parsed);
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ message: 'Error fetching applications' });
    }
};

// Submit a job application
exports.submitApplication = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            job_id,
            name,
            age,
            contact_number,
            address,
            previous_job,
            years_experience,
            skills,
            highest_education,
            worked_abroad,
            start_date
        } = req.body;

        // Validate required fields
        if (!job_id || !name || !age || !contact_number || !address || !previous_job || years_experience === undefined || !highest_education || start_date === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Parse skills if it's a JSON string
        let parsedSkills = skills;
        if (typeof skills === 'string') {
            try {
                parsedSkills = JSON.parse(skills);
            } catch (e) {
                parsedSkills = [];
            }
        }

        // Insert application
        const applicationQuery = `
            INSERT INTO applications 
            (job_id, user_id, name, age, contact_number, address, previous_job, 
             years_experience, skills, highest_education, worked_abroad, start_date, status, submitted_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())
        `;

        const [result] = await db.query(applicationQuery, [
            job_id,
            userId,
            name,
            age,
            contact_number,
            address,
            previous_job,
            years_experience,
            JSON.stringify(parsedSkills),
            highest_education,
            worked_abroad ? 1 : 0,
            start_date
        ]);

        const applicationId = result.insertId;

        // Handle file uploads
        if (req.files && req.files.length > 0) {
            const documentQuery = `
                INSERT INTO documents (application_id, document_type, file_path, original_filename, mime_type, uploaded_at)
                VALUES (?, ?, ?, ?, ?, NOW())
            `;

            // Get document types mapping if provided
            let documentTypes = [];
            if (req.body.documentTypes) {
                try {
                    documentTypes = JSON.parse(req.body.documentTypes);
                } catch (e) {
                    console.warn('Failed to parse document types:', e);
                }
            }

            for (let i = 0; i < req.files.length; i++) {
                const file = req.files[i];
                const documentType = documentTypes[i] || file.fieldname || 'document';
                
                await db.query(documentQuery, [
                    applicationId,
                    documentType,
                    file.path,
                    file.originalname,
                    file.mimetype
                ]);
            }
        }

        res.json({ 
            success: true, 
            message: 'Application submitted successfully',
            applicationId 
        });
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({ message: 'Error submitting application: ' + error.message });
    }
};

// Get application by ID
exports.getApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const query = `
            SELECT a.*, d.* 
            FROM applications a
            LEFT JOIN documents d ON a.id = d.application_id
            WHERE a.id = ? AND a.user_id = ?
        `;

        const [results] = await db.query(query, [id, userId]);
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.json(results[0]);
    } catch (error) {
        console.error('Error fetching application:', error);
        res.status(500).json({ message: 'Error fetching application' });
    }
};

// Update application status (admin/employer)
exports.updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const query = 'UPDATE applications SET status = ? WHERE id = ?';
        await db.query(query, [status, id]);

        res.json({ success: true, message: 'Application status updated' });
    } catch (error) {
        console.error('Error updating application:', error);
        res.status(500).json({ message: 'Error updating application' });
    }
};

// Delete application
exports.deleteApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // First delete associated documents
        const docQuery = 'SELECT file_path FROM documents WHERE application_id = ?';
        const [docs] = await db.query(docQuery, [id]);

        for (const doc of docs) {
            const filePath = path.join(__dirname, '..', doc.file_path);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Delete documents from DB
        await db.query('DELETE FROM documents WHERE application_id = ?', [id]);

        // Delete application
        const appQuery = 'DELETE FROM applications WHERE id = ? AND user_id = ?';
        await db.query(appQuery, [id, userId]);

        res.json({ success: true, message: 'Application deleted' });
    } catch (error) {
        console.error('Error deleting application:', error);
        res.status(500).json({ message: 'Error deleting application' });
    }
};
