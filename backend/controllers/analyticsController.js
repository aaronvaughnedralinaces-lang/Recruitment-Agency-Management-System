const db = require('../config/database');

// Get analytics metrics
exports.getMetrics = async (req, res) => {
    try {
        const query = `
            SELECT
                COUNT(a.id) as total_applications,
                SUM(CASE WHEN a.status = 'pending' THEN 1 ELSE 0 END) as pending_applications,
                SUM(CASE WHEN a.status = 'shortlisted' THEN 1 ELSE 0 END) as approved_applications,
                SUM(CASE WHEN a.status = 'rejected' THEN 1 ELSE 0 END) as rejected_applications,
                SUM(CASE WHEN a.status = 'hired' THEN 1 ELSE 0 END) as hired_count
            FROM applications a
        `;

        const [metrics] = await db.query(query);
        res.json(metrics[0] || {});
    } catch (error) {
        console.error('Error fetching metrics:', error);
        res.status(500).json({ message: 'Error fetching metrics' });
    }
};

// Get trends data
exports.getTrends = async (req, res) => {
    try {
        const range = req.query.range || 'month'; // week, month, year
        
        let dateCondition = "DATE_SUB(NOW(), INTERVAL 30 DAY)";
        if (range === 'week') dateCondition = "DATE_SUB(NOW(), INTERVAL 7 DAY)";
        if (range === 'year') dateCondition = "DATE_SUB(NOW(), INTERVAL 365 DAY)";

        const query = `
            SELECT 
                DATE(submitted_at) as date,
                COUNT(*) as applications
            FROM applications
            WHERE submitted_at >= ${dateCondition}
            GROUP BY DATE(submitted_at)
            ORDER BY date ASC
        `;

        const [trends] = await db.query(query);
        res.json(trends);
    } catch (error) {
        console.error('Error fetching trends:', error);
        res.status(500).json({ message: 'Error fetching trends' });
    }
};

// Get job performance metrics
exports.getJobPerformance = async (req, res) => {
    try {
        const query = `
            SELECT
                j.id as job_id,
                j.title as job_title,
                COUNT(a.id) as total_applications,
                SUM(CASE WHEN a.status = 'shortlisted' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN a.status = 'hired' THEN 1 ELSE 0 END) as hired,
                ROUND(SUM(CASE WHEN a.status = 'shortlisted' THEN 1 ELSE 0 END) / COUNT(a.id) * 100, 2) as conversion_rate
            FROM jobs j
            LEFT JOIN applications a ON j.id = a.job_id
            GROUP BY j.id
            ORDER BY total_applications DESC
        `;

        const [performance] = await db.query(query);
        res.json(performance);
    } catch (error) {
        console.error('Error fetching job performance:', error);
        res.status(500).json({ message: 'Error fetching job performance' });
    }
};
