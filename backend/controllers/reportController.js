const db = require('../config/database');
const fs = require('fs');
const path = require('path');

// Generate report
exports.generateReport = async (req, res) => {
    try {
        const { name, type, period } = req.body;
        const companyId = req.user.company_id;

        // Generate report data based on type
        let reportData = {};

        if (type === 'recruitment') {
            const [data] = await db.query(`
                SELECT 
                    COUNT(*) as total_applications,
                    COUNT(DISTINCT job_id) as total_jobs,
                    SUM(CASE WHEN status = 'hired' THEN 1 ELSE 0 END) as hired_count,
                    SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count
                FROM applications a
                JOIN jobs j ON a.job_id = j.id
                WHERE j.company_id = ? AND DATE(a.submitted_at) >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            `, [companyId]);
            reportData = data[0];
        }

        // Create report in database
        const reportPath = `reports/${type}_${Date.now()}.pdf`;
        const query = `
            INSERT INTO reports (name, type, period, file_path, generated_date)
            VALUES (?, ?, ?, ?, NOW())
        `;

        const [result] = await db.query(query, [name, type, period, reportPath]);

        res.json({ 
            success: true, 
            message: 'Report generated', 
            reportId: result.insertId,
            data: reportData 
        });
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ message: 'Error generating report' });
    }
};

// Get reports
exports.getReports = async (req, res) => {
    try {
        const query = 'SELECT * FROM reports ORDER BY generated_date DESC LIMIT 50';
        const [reports] = await db.query(query);
        res.json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Error fetching reports' });
    }
};

// Download report
exports.downloadReport = async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'SELECT file_path FROM reports WHERE id = ?';
        const [results] = await db.query(query, [id]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'Report not found' });
        }

        const filePath = path.join(__dirname, '..', results[0].file_path);
        res.download(filePath);
    } catch (error) {
        console.error('Error downloading report:', error);
        res.status(500).json({ message: 'Error downloading report' });
    }
};

// Delete report
exports.deleteReport = async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'SELECT file_path FROM reports WHERE id = ?';
        const [results] = await db.query(query, [id]);

        if (results.length > 0 && results[0].file_path) {
            const filePath = path.join(__dirname, '..', results[0].file_path);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await db.query('DELETE FROM reports WHERE id = ?', [id]);
        res.json({ success: true, message: 'Report deleted' });
    } catch (error) {
        console.error('Error deleting report:', error);
        res.status(500).json({ message: 'Error deleting report' });
    }
};

// Schedule report
exports.scheduleReport = async (req, res) => {
    try {
        const { name, type, frequency, recipients } = req.body;

        const query = `
            INSERT INTO scheduled_reports (name, type, frequency, recipients, created_at)
            VALUES (?, ?, ?, ?, NOW())
        `;

        await db.query(query, [name, type, frequency, recipients]);
        res.json({ success: true, message: 'Report scheduled' });
    } catch (error) {
        console.error('Error scheduling report:', error);
        res.status(500).json({ message: 'Error scheduling report' });
    }
};
