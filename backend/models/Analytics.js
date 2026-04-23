const db = require('../config/database');

class Analytics {
    static async getMetrics() {
        const query = `
            SELECT 
                COUNT(*) as total_applications,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_applications,
                SUM(CASE WHEN status = 'shortlisted' THEN 1 ELSE 0 END) as shortlisted_applications,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_applications,
                SUM(CASE WHEN status = 'hired' THEN 1 ELSE 0 END) as hired_applications,
                COUNT(DISTINCT company_id) as total_companies,
                COUNT(DISTINCT job_id) as total_jobs
            FROM applications
        `;
        const [rows] = await db.query(query);
        return rows[0];
    }

    static async getApplicationsByStatus() {
        const query = `
            SELECT status, COUNT(*) as count 
            FROM applications 
            GROUP BY status
        `;
        const [rows] = await db.query(query);
        return rows;
    }

    static async getTrends(days = 30) {
        const query = `
            SELECT 
                DATE(submitted_at) as date,
                COUNT(*) as applications,
                SUM(CASE WHEN status = 'hired' THEN 1 ELSE 0 END) as hired,
                SUM(CASE WHEN status = 'shortlisted' THEN 1 ELSE 0 END) as shortlisted
            FROM applications 
            WHERE submitted_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY DATE(submitted_at)
            ORDER BY date ASC
        `;
        const [rows] = await db.query(query, [days]);
        return rows;
    }

    static async getJobPerformance() {
        const query = `
            SELECT 
                j.id,
                j.title,
                c.name as company_name,
                COUNT(a.id) as total_applications,
                SUM(CASE WHEN a.status = 'hired' THEN 1 ELSE 0 END) as hired,
                SUM(CASE WHEN a.status = 'shortlisted' THEN 1 ELSE 0 END) as shortlisted,
                SUM(CASE WHEN a.status = 'pending' THEN 1 ELSE 0 END) as pending,
                ROUND((SUM(CASE WHEN a.status = 'shortlisted' THEN 1 ELSE 0 END) / COUNT(a.id)) * 100, 2) as shortlist_rate,
                ROUND((SUM(CASE WHEN a.status = 'hired' THEN 1 ELSE 0 END) / COUNT(a.id)) * 100, 2) as hire_rate
            FROM jobs j
            LEFT JOIN companies c ON j.company_id = c.id
            LEFT JOIN applications a ON j.id = a.job_id
            GROUP BY j.id, j.title, c.name
            ORDER BY total_applications DESC
        `;
        const [rows] = await db.query(query);
        return rows;
    }

    static async getCompanyMetrics(companyId) {
        const query = `
            SELECT 
                COUNT(DISTINCT j.id) as total_jobs,
                COUNT(a.id) as total_applications,
                SUM(CASE WHEN a.status = 'hired' THEN 1 ELSE 0 END) as hired,
                SUM(CASE WHEN a.status = 'shortlisted' THEN 1 ELSE 0 END) as shortlisted,
                ROUND(AVG(CASE WHEN s.score IS NOT NULL THEN s.score ELSE NULL END), 2) as average_score
            FROM companies c
            LEFT JOIN jobs j ON c.id = j.company_id
            LEFT JOIN applications a ON j.id = a.job_id
            LEFT JOIN screenings s ON a.id = s.application_id
            WHERE c.id = ?
        `;
        const [rows] = await db.query(query, [companyId]);
        return rows[0];
    }

    static async getApplicationSource() {
        const query = `
            SELECT 
                source,
                COUNT(*) as count
            FROM applications
            WHERE source IS NOT NULL
            GROUP BY source
            ORDER BY count DESC
        `;
        const [rows] = await db.query(query);
        return rows;
    }

    static async getConversionRate() {
        const totalApps = await db.query(`SELECT COUNT(*) as count FROM applications`);
        const hiredApps = await db.query(`SELECT COUNT(*) as count FROM applications WHERE status = 'hired'`);
        
        const total = totalApps[0][0].count;
        const hired = hiredApps[0][0].count;
        
        return total > 0 ? Math.round((hired / total) * 100) : 0;
    }

    static async getAverageTimeToHire() {
        const query = `
            SELECT 
                AVG(DATEDIFF(updated_at, submitted_at)) as average_days
            FROM applications
            WHERE status = 'hired'
        `;
        const [rows] = await db.query(query);
        return rows[0].average_days || 0;
    }

    static async getTopSkills() {
        const query = `
            SELECT 
                a.skills,
                COUNT(*) as candidate_count
            FROM applications a
            WHERE a.skills IS NOT NULL
            GROUP BY a.skills
            ORDER BY candidate_count DESC
            LIMIT 10
        `;
        const [rows] = await db.query(query);
        return rows;
    }
}

module.exports = Analytics;
