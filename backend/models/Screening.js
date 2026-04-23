const db = require('../config/database');

class Screening {
    static async create(data) {
        const { application_id, status, score } = data;
        const query = `
            INSERT INTO screenings (application_id, status, score, screened_at)
            VALUES (?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE status = ?, score = ?
        `;
        const [result] = await db.query(query, [application_id, status, score, status, score]);
        return result;
    }

    static async findById(id) {
        const query = `SELECT * FROM screenings WHERE id = ?`;
        const [rows] = await db.query(query, [id]);
        return rows[0];
    }

    static async findByApplicationId(applicationId) {
        const query = `SELECT * FROM screenings WHERE application_id = ?`;
        const [rows] = await db.query(query, [applicationId]);
        return rows[0];
    }

    static async findAll() {
        const query = `
            SELECT s.*, a.name, a.email, a.skills, j.title as job_title 
            FROM screenings s
            JOIN applications a ON s.application_id = a.id
            JOIN jobs j ON a.job_id = j.id
            ORDER BY s.screened_at DESC
        `;
        const [rows] = await db.query(query);
        return rows;
    }

    static async findByStatus(status) {
        const query = `
            SELECT s.*, a.name, a.email, a.skills, j.title as job_title 
            FROM screenings s
            JOIN applications a ON s.application_id = a.id
            JOIN jobs j ON a.job_id = j.id
            WHERE s.status = ? 
            ORDER BY s.screened_at DESC
        `;
        const [rows] = await db.query(query, [status]);
        return rows;
    }

    static async findByScoreRange(minScore, maxScore) {
        const query = `
            SELECT s.*, a.name, a.email, a.skills, j.title as job_title 
            FROM screenings s
            JOIN applications a ON s.application_id = a.id
            JOIN jobs j ON a.job_id = j.id
            WHERE s.score BETWEEN ? AND ? 
            ORDER BY s.score DESC
        `;
        const [rows] = await db.query(query, [minScore, maxScore]);
        return rows;
    }

    static async findRecommended(minScore = 8) {
        const query = `
            SELECT s.*, a.name, a.email, a.skills, j.title as job_title 
            FROM screenings s
            JOIN applications a ON s.application_id = a.id
            JOIN jobs j ON a.job_id = j.id
            WHERE s.score >= ? AND s.status = 'pending'
            ORDER BY s.score DESC
        `;
        const [rows] = await db.query(query, [minScore]);
        return rows;
    }

    static async update(id, data) {
        const { status, score } = data;
        let query = `UPDATE screenings SET `;
        const params = [];
        const updates = [];

        if (status !== undefined) {
            updates.push(`status = ?`);
            params.push(status);
        }
        if (score !== undefined) {
            updates.push(`score = ?`);
            params.push(score);
        }

        updates.push(`screened_at = NOW()`);
        query += updates.join(', ') + ` WHERE id = ?`;
        params.push(id);

        const [result] = await db.query(query, params);
        return result;
    }

    static async delete(id) {
        const query = `DELETE FROM screenings WHERE id = ?`;
        const [result] = await db.query(query, [id]);
        return result;
    }

    static async bulkUpdate(ids, data) {
        const { status, score } = data;
        let query = `UPDATE screenings SET `;
        const params = [];
        const updates = [];

        if (status !== undefined) {
            updates.push(`status = ?`);
            params.push(status);
        }
        if (score !== undefined) {
            updates.push(`score = ?`);
            params.push(score);
        }

        updates.push(`screened_at = NOW()`);
        query += updates.join(', ') + ` WHERE id IN (${ids.map(() => '?').join(',')})`;
        params.push(...ids);

        const [result] = await db.query(query, params);
        return result;
    }

    static async getSummary() {
        const query = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                AVG(score) as average_score,
                MAX(score) as highest_score,
                MIN(score) as lowest_score
            FROM screenings
        `;
        const [rows] = await db.query(query);
        return rows[0];
    }
}

module.exports = Screening;
