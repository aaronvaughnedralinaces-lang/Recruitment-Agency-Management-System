const db = require('../config/database');

class Application {
    static async create(data) {
        const query = `
            INSERT INTO applications 
            (job_id, user_id, name, age, contact_number, address, previous_job, 
             years_experience, skills, highest_education, worked_abroad, start_date, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        try {
            const [result] = await db.query(query, [
                data.jobId,
                data.userId,
                data.name,
                data.age,
                data.contactNumber,
                data.address,
                data.previousJob,
                data.yearsExperience,
                JSON.stringify(data.skills),
                data.highestEducation,
                data.workedAbroad ? 1 : 0,
                data.startDate,
                'pending'
            ]);
            return result;
        } catch (error) {
            throw new Error('Failed to create application: ' + error.message);
        }
    }

    static async findById(id) {
        const query = 'SELECT * FROM applications WHERE id = ?';
        const [results] = await db.query(query, [id]);
        return results[0] || null;
    }

    static async findByUserId(userId) {
        const query = 'SELECT * FROM applications WHERE user_id = ? ORDER BY submitted_at DESC';
        const [results] = await db.query(query, [userId]);
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
        const query = `UPDATE applications SET ${fields.join(', ')} WHERE id = ?`;
        const [result] = await db.query(query, values);
        return result;
    }

    static async delete(id) {
        const query = 'DELETE FROM applications WHERE id = ?';
        const [result] = await db.query(query, [id]);
        return result;
    }
}

module.exports = Application;
