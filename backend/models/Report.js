const db = require('../config/database');

class Report {
    static async create(data) {
        const { name, type, period, file_path, company_id } = data;
        const query = `
            INSERT INTO reports (name, type, period, file_path, company_id, generated_date)
            VALUES (?, ?, ?, ?, ?, NOW())
        `;
        const [result] = await db.query(query, [name, type, period, file_path, company_id]);
        return result;
    }

    static async findById(id) {
        const query = `SELECT * FROM reports WHERE id = ?`;
        const [rows] = await db.query(query, [id]);
        return rows[0];
    }

    static async findByCompanyId(companyId) {
        const query = `
            SELECT * FROM reports 
            WHERE company_id = ? 
            ORDER BY generated_date DESC
        `;
        const [rows] = await db.query(query, [companyId]);
        return rows;
    }

    static async findByType(type) {
        const query = `
            SELECT * FROM reports 
            WHERE type = ? 
            ORDER BY generated_date DESC
        `;
        const [rows] = await db.query(query, [type]);
        return rows;
    }

    static async findAll() {
        const query = `SELECT * FROM reports ORDER BY generated_date DESC`;
        const [rows] = await db.query(query);
        return rows;
    }

    static async update(id, data) {
        const { name, type, period, file_path } = data;
        let query = `UPDATE reports SET `;
        const params = [];
        const updates = [];

        if (name !== undefined) {
            updates.push(`name = ?`);
            params.push(name);
        }
        if (type !== undefined) {
            updates.push(`type = ?`);
            params.push(type);
        }
        if (period !== undefined) {
            updates.push(`period = ?`);
            params.push(period);
        }
        if (file_path !== undefined) {
            updates.push(`file_path = ?`);
            params.push(file_path);
        }

        query += updates.join(', ') + ` WHERE id = ?`;
        params.push(id);

        const [result] = await db.query(query, params);
        return result;
    }

    static async delete(id) {
        const query = `DELETE FROM reports WHERE id = ?`;
        const [result] = await db.query(query, [id]);
        return result;
    }

    static async deleteByCompanyId(companyId) {
        const query = `DELETE FROM reports WHERE company_id = ?`;
        const [result] = await db.query(query, [companyId]);
        return result;
    }

    static async findScheduled() {
        const query = `SELECT * FROM scheduled_reports ORDER BY next_run_date ASC`;
        const [rows] = await db.query(query);
        return rows;
    }

    static async createScheduled(data) {
        const { name, type, period, frequency, company_id } = data;
        const query = `
            INSERT INTO scheduled_reports (name, type, period, frequency, company_id, next_run_date, created_at)
            VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        `;
        const [result] = await db.query(query, [name, type, period, frequency, company_id]);
        return result;
    }

    static async deleteScheduled(id) {
        const query = `DELETE FROM scheduled_reports WHERE id = ?`;
        const [result] = await db.query(query, [id]);
        return result;
    }
}

module.exports = Report;
