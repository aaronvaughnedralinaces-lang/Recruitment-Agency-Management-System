const db = require('../config/database');

const Job = {
    // ========== Helper Methods ==========
    _ensureTags: async (tagNames) => {
        const tagIds = [];
        for (const name of tagNames) {
            let [rows] = await db.query('SELECT id FROM tags WHERE name = ?', [name]);
            let tagId;
            if (rows.length === 0) {
                const [result] = await db.query('INSERT INTO tags (name) VALUES (?)', [name]);
                tagId = result.insertId;
            } else {
                tagId = rows[0].id;
            }
            tagIds.push(tagId);
        }
        return tagIds;
    },

    _setJobTags: async (jobId, tagNames) => {
        // Remove duplicates
        const uniqueTagNames = [...new Set(tagNames)];
        // Remove existing tags
        await db.query('DELETE FROM job_tags WHERE job_id = ?', [jobId]);
        // Insert new tags
        const tagIds = await Job._ensureTags(uniqueTagNames);
        if (tagIds.length) {
            const values = tagIds.map(tagId => [jobId, tagId]);
            await db.query('INSERT INTO job_tags (job_id, tag_id) VALUES ?', [values]);
        }
    },

    getTagsForJob: async (jobId) => {
        try {
            const [rows] = await db.query(
                `SELECT t.name FROM job_tags jt
                 INNER JOIN tags t ON jt.tag_id = t.id
                 WHERE jt.job_id = ?`,
                [jobId]
            );
            return rows.map(row => row.name);
        } catch (err) {
            // Keep jobs API working even if tags tables are not present in a target DB.
            if (err && (err.code === 'ER_NO_SUCH_TABLE' || err.code === 'ER_BAD_FIELD_ERROR' || err.message.includes('Unknown'))) {
                console.warn(`Tags unavailable for job ${jobId}:`, err.message);
                return [];
            }
            console.error(`Tag query failed for job ${jobId}:`, err.message);
            throw err;
        }
    },

    // ========== CRUD Methods ==========
    findByCompanyId: async (companyId) => {
        const [jobs] = await db.query(
            'SELECT * FROM jobs WHERE company_id = ? ORDER BY posted_date DESC',
            [companyId]
        );
        for (let job of jobs) {
            job.tags = await Job.getTagsForJob(job.id);
        }
        return jobs;
    },

    create: async (jobData, tagNames = []) => {
        const { company_id, title, description, location, salary_range, status, created_by } = jobData;
        const posted_date = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const [result] = await db.query(
            `INSERT INTO jobs (company_id, title, description, location, salary_range, posted_date, status, created_by) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [company_id, title, description, location, salary_range, posted_date, status, created_by]
        );
        const newJobId = result.insertId;
        if (tagNames.length) {
            await Job._setJobTags(newJobId, tagNames);
        }
        
        // FIX IS HERE 👇
        const [rows] = await db.query('SELECT * FROM jobs WHERE id = ?', [newJobId]);
        const newJob = rows[0]; // Extract the single job object from the rows array
        newJob.tags = await Job.getTagsForJob(newJobId);
        
        return newJob;
    },

    update: async (id, companyId, updateData, tagNames = null) => {
        const { title, description, location, salary_range } = updateData;
        const [result] = await db.query(
            `UPDATE jobs 
             SET title = ?, description = ?, location = ?, salary_range = ?
             WHERE id = ? AND company_id = ?`,
            [title, description, location, salary_range, id, companyId]
        );
        if (result.affectedRows === 0) return null;
        if (tagNames !== null) {
            await Job._setJobTags(id, tagNames);
        }
        
        // FIX IS HERE 👇
        const [rows] = await db.query('SELECT * FROM jobs WHERE id = ?', [id]);
        const updatedJob = rows[0]; // Extract the single job object from the rows array
        updatedJob.tags = await Job.getTagsForJob(id);
        
        return updatedJob;
    },

    delete: async (id, companyId) => {
        const [result] = await db.query('DELETE FROM jobs WHERE id = ? AND company_id = ?', [id, companyId]);
        return result.affectedRows;
    },
    // models/Job.js – add this function inside the Job object
        getAllOpen: async ({ limit, sortField, sortOrder, status }) => {
        try {
            const query = `
                SELECT j.*, 
                    c.name AS company_name, 
                    c.logo AS company_logo
                FROM jobs j
                LEFT JOIN companies c ON j.company_id = c.id
                WHERE j.status = ? 
                ORDER BY j.${sortField} ${sortOrder}
                LIMIT ?
            `;
            const [rows] = await db.query(query, [status, limit]);
            
            for (const job of rows) {
                job.tags = await Job.getTagsForJob(job.id);
            }
            return rows;
        } catch (err) {
            console.error('getAllOpen error:', err.message, 'SQL:', err.sql);
            throw err;
        }
    },
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT j.*, c.name as company_name
            FROM jobs j
            LEFT JOIN companies c ON j.company_id = c.id
            ORDER BY j.posted_date DESC
        `);
        for (let job of rows) {
            job.tags = await Job.getTagsForJob(job.id);
        }
        return rows;
    }
};


module.exports = Job;