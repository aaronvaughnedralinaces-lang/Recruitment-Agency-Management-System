const db = require('../config/database');

const Career = {
    findByUserId: async (userId) => {
        const [rows] = await db.query(
            // FIXED: Changed career_history to career
            'SELECT * FROM career WHERE user_id = ? ORDER BY start_date DESC',
            [userId]
        );
        return rows;
    },
    create: async (userId, data) => {
        const { job_title, company_name, start_date, end_date, description } = data;
        const [result] = await db.query(
            // FIXED: Changed career_history to career
            'INSERT INTO career (user_id, job_title, company_name, start_date, end_date, description) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, job_title, company_name, start_date, end_date || null, description || null]
        );
        return result.insertId;
    },
    update: async (id, userId, data) => {
        const { job_title, company_name, start_date, end_date, description } = data;
        const [result] = await db.query(
            // FIXED: Changed career_history to career
            'UPDATE career SET job_title = ?, company_name = ?, start_date = ?, end_date = ?, description = ? WHERE id = ? AND user_id = ?',
            [job_title, company_name, start_date, end_date || null, description || null, id, userId]
        );
        return result.affectedRows;
    },
    delete: async (id, userId) => {
        // FIXED: Changed career_history to career
        const [result] = await db.query('DELETE FROM career WHERE id = ? AND user_id = ?', [id, userId]);
        return result.affectedRows;
    }
};

module.exports = Career;