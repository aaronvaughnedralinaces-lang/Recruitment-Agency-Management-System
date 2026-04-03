const db = require('../config/database');

const Education = {
    findByUserId: async (userId) => {
        const [rows] = await db.query(
            'SELECT * FROM education WHERE user_id = ? ORDER BY completion_date DESC',
            [userId]
        );
        return rows;
    },
    create: async (userId, data) => {
        const { qualification, institution, completion_date, highlights } = data;
        const [result] = await db.query(
            'INSERT INTO education (user_id, qualification, institution, completion_date, highlights) VALUES (?, ?, ?, ?, ?)',
            [userId, qualification, institution, completion_date, highlights || null]
        );
        return result.insertId;
    },
    update: async (id, userId, data) => {
        const { qualification, institution, completion_date, highlights } = data;
        const [result] = await db.query(
            'UPDATE education SET qualification = ?, institution = ?, completion_date = ?, highlights = ? WHERE id = ? AND user_id = ?',
            [qualification, institution, completion_date, highlights || null, id, userId]
        );
        return result.affectedRows;
    },
    delete: async (id, userId) => {
        const [result] = await db.query('DELETE FROM education WHERE id = ? AND user_id = ?', [id, userId]);
        return result.affectedRows;
    }
};

module.exports = Education;