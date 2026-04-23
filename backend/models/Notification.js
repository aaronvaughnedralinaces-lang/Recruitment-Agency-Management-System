const db = require('../config/database');

class Notification {
    static async create(data) {
        const { user_id, type, title, message } = data;
        const query = `
            INSERT INTO notifications (user_id, type, title, message, \`read\`, created_at)
            VALUES (?, ?, ?, ?, 0, NOW())
        `;
        const [result] = await db.query(query, [user_id, type, title, message]);
        return result;
    }

    static async findById(id) {
        const query = `SELECT * FROM notifications WHERE id = ?`;
        const [rows] = await db.query(query, [id]);
        return rows[0];
    }

    static async findByUserId(userId) {
        const query = `
            SELECT * FROM notifications 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        `;
        const [rows] = await db.query(query, [userId]);
        return rows;
    }

    static async findUnreadByUserId(userId) {
        const query = `
            SELECT * FROM notifications 
            WHERE user_id = ? AND \`read\` = 0
            ORDER BY created_at DESC
        `;
        const [rows] = await db.query(query, [userId]);
        return rows;
    }

    static async update(id, data) {
        const { read, type, title, message } = data;
        let query = `UPDATE notifications SET `;
        const params = [];
        const updates = [];

        if (read !== undefined) {
            updates.push(`\`read\` = ?`);
            params.push(read ? 1 : 0);
        }
        if (type !== undefined) {
            updates.push(`type = ?`);
            params.push(type);
        }
        if (title !== undefined) {
            updates.push(`title = ?`);
            params.push(title);
        }
        if (message !== undefined) {
            updates.push(`message = ?`);
            params.push(message);
        }

        query += updates.join(', ') + ` WHERE id = ?`;
        params.push(id);

        const [result] = await db.query(query, params);
        return result;
    }

    static async delete(id) {
        const query = `DELETE FROM notifications WHERE id = ?`;
        const [result] = await db.query(query, [id]);
        return result;
    }

    static async deleteByUserId(userId) {
        const query = `DELETE FROM notifications WHERE user_id = ?`;
        const [result] = await db.query(query, [userId]);
        return result;
    }

    static async markAllAsRead(userId) {
        const query = `UPDATE notifications SET \`read\` = 1 WHERE user_id = ?`;
        const [result] = await db.query(query, [userId]);
        return result;
    }

    static async getUnreadCount(userId) {
        const query = `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND \`read\` = 0`;
        const [rows] = await db.query(query, [userId]);
        return rows[0].count;
    }
}

module.exports = Notification;
