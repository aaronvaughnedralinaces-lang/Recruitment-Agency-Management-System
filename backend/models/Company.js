const db = require('../config/database');

const Company = {
    findById: async (id) => {
        const [rows] = await db.query(
            'SELECT id, name, description, logo, location, website, contact_email, contact_phone, verified_status FROM companies WHERE id = ?',
            [id]
        );
        return rows[0];
    },
    findByUserId: async (userId) => {
        const [userRows] = await db.query('SELECT company_id FROM users WHERE id = ?', [userId]);
        if (!userRows[0]?.company_id) return null;
        return Company.findById(userRows[0].company_id);
    },
    create: async (companyData) => {
        const { name, description, logo, location, website, contact_email, contact_phone } = companyData;
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const [result] = await db.query(
            `INSERT INTO companies (name, description, logo, location, website, contact_email, contact_phone, created_at, updated_at, verified_status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, description, logo, location, website, contact_email, contact_phone, now, now, 'unverified']
        );
        return result.insertId;
    },
    update: async (id, companyData) => {
        const { name, description, logo, location, website, contact_email, contact_phone } = companyData;
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        await db.query(
            `UPDATE companies SET name = ?, description = ?, logo = ?, location = ?, website = ?, contact_email = ?, contact_phone = ?, updated_at = ? WHERE id = ?`,
            [name, description, logo, location, website, contact_email, contact_phone, now, id]
        );
    },
    updateVerificationStatus: async (id, status) => {
        await db.query('UPDATE companies SET verified_status = ? WHERE id = ?', [status, id]);
    },
    // For admin
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT id, name, description, logo, location, website, 
                   contact_email, contact_phone, verified_status, created_at
            FROM companies
            ORDER BY created_at DESC
        `);
        return rows;
    }
};

module.exports = Company;