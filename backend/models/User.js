const db = require('../config/database');
const bcrypt = require('bcrypt');

const User = {
    findByEmail: async (email) => {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    },
    findById: async (id) => {
        const [rows] = await db.query(
            'SELECT id, first_name, last_name, email, bio, role, status, company_id FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    },
    create: async (userData) => {
        const { first_name, last_name, email, password_hash, role, status } = userData;
        const [result] = await db.query(
            'INSERT INTO users (first_name, last_name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?)',
            [first_name, last_name, email, password_hash, role, status]
        );
        return result.insertId;
    },
    updateCompanyId: async (userId, companyId) => {
        await db.query('UPDATE users SET company_id = ? WHERE id = ?', [companyId, userId]);
    },
    updateBio: async (userId, bio) => {
        await db.query('UPDATE users SET bio = ? WHERE id = ?', [bio, userId]);
    },
    updateLastLogin: async (userId) => {
        await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [userId]);
    },
    // For admin
    getAllUsers: async () => {
        const [rows] = await db.query(`
            SELECT id, first_name, last_name, email, role, status, created_at, company_id
            FROM users
            ORDER BY created_at DESC
        `);
        return rows;
    }
};

module.exports = User;