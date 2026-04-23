const db = require('../config/database');

class Interview {
    static async create(data) {
        const query = `
            INSERT INTO interviews 
            (application_id, interview_type, scheduled_date, scheduled_time, location, meeting_link, notes, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled')
        `;

        try {
            const [result] = await db.query(query, [
                data.applicationId,
                data.interviewType,
                data.scheduledDate,
                data.scheduledTime,
                data.location || null,
                data.meetingLink || null,
                data.notes || null
            ]);
            return result;
        } catch (error) {
            throw new Error('Failed to create interview: ' + error.message);
        }
    }

    static async findById(id) {
        const query = 'SELECT * FROM interviews WHERE id = ?';
        const [results] = await db.query(query, [id]);
        return results[0] || null;
    }

    static async findByApplicationId(applicationId) {
        const query = 'SELECT * FROM interviews WHERE application_id = ?';
        const [results] = await db.query(query, [applicationId]);
        return results;
    }

    static async update(id, data) {
        const fields = [];
        const values = [];

        for (const [key, value] of Object.entries(data)) {
            fields.push(`${key} = ?`);
            values.push(value);
        }

        values.push(id);
        const query = `UPDATE interviews SET ${fields.join(', ')} WHERE id = ?`;
        const [result] = await db.query(query, values);
        return result;
    }

    static async delete(id) {
        const query = 'DELETE FROM interviews WHERE id = ?';
        const [result] = await db.query(query, [id]);
        return result;
    }
}

module.exports = Interview;
