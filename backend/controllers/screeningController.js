const db = require('../config/database');

// Get candidates for screening
exports.getCandidates = async (req, res) => {
    try {
        const query = `
            SELECT 
                a.id,
                a.name,
                a.email,
                j.title as position,
                a.years_experience,
                COALESCE(s.score, 0) as score,
                COALESCE(s.status, 'reviewed') as status,
                a.skills,
                u.email as user_email
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            JOIN users u ON a.user_id = u.id
            LEFT JOIN screenings s ON a.id = s.application_id
            ORDER BY a.submitted_at DESC
        `;

        const [candidates] = await db.query(query);
        
        // Parse skills
        const parsed = candidates.map(candidate => ({
            ...candidate,
            skills: candidate.skills ? JSON.parse(candidate.skills) : []
        }));

        res.json(parsed);
    } catch (error) {
        console.error('Error fetching candidates:', error);
        res.status(500).json({ message: 'Error fetching candidates' });
    }
};

// Update candidate screening score
exports.updateCandidateScore = async (req, res) => {
    try {
        const { candidateId } = req.params;
        const { status, score } = req.body;

        const query = `
            INSERT INTO screenings (application_id, status, score)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                status = VALUES(status),
                score = VALUES(score)
        `;

        await db.query(query, [candidateId, status, score]);
        res.json({ success: true, message: 'Candidate score updated' });
    } catch (error) {
        console.error('Error updating candidate score:', error);
        res.status(500).json({ message: 'Error updating candidate score' });
    }
};

// Get recommended candidates
exports.getRecommendedCandidates = async (req, res) => {
    try {
        const query = `
            SELECT 
                a.id,
                a.name,
                a.email,
                j.title as position,
                a.years_experience,
                s.score,
                a.skills,
                u.email as user_email
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            JOIN users u ON a.user_id = u.id
            LEFT JOIN screenings s ON a.id = s.application_id
            WHERE s.score >= 8 OR (s.status = 'shortlisted' AND s.score IS NULL)
            ORDER BY s.score DESC, a.submitted_at DESC
        `;

        const [candidates] = await db.query(query);
        
        const parsed = candidates.map(candidate => ({
            ...candidate,
            skills: candidate.skills ? JSON.parse(candidate.skills) : []
        }));

        res.json(parsed);
    } catch (error) {
        console.error('Error fetching recommended candidates:', error);
        res.status(500).json({ message: 'Error fetching recommended candidates' });
    }
};

// Bulk screen candidates
exports.bulkScreenCandidates = async (req, res) => {
    try {
        const { updates } = req.body; // Array of { candidateId, status, score }

        for (const update of updates) {
            const query = `
                INSERT INTO screenings (application_id, status, score)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                    status = VALUES(status),
                    score = VALUES(score)
            `;
            
            await db.query(query, [update.candidateId, update.status, update.score]);
        }

        res.json({ success: true, message: 'Bulk screening completed' });
    } catch (error) {
        console.error('Error bulk screening:', error);
        res.status(500).json({ message: 'Error bulk screening' });
    }
};

// Get screening summary
exports.getScreeningSummary = async (req, res) => {
    try {
        const query = `
            SELECT
                COUNT(*) as total_candidates,
                SUM(CASE WHEN s.score >= 8 THEN 1 ELSE 0 END) as high_score,
                SUM(CASE WHEN s.score >= 6 AND s.score < 8 THEN 1 ELSE 0 END) as medium_score,
                SUM(CASE WHEN s.score < 6 THEN 1 ELSE 0 END) as low_score,
                SUM(CASE WHEN s.status = 'shortlisted' THEN 1 ELSE 0 END) as shortlisted_count
            FROM applications a
            LEFT JOIN screenings s ON a.id = s.application_id
        `;

        const [summary] = await db.query(query);
        res.json(summary[0]);
    } catch (error) {
        console.error('Error fetching screening summary:', error);
        res.status(500).json({ message: 'Error fetching screening summary' });
    }
};
