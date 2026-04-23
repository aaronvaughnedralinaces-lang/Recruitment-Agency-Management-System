const db = require('../config/database');

// Schedule an interview
exports.scheduleInterview = async (req, res) => {
    try {
        const { applicationId, interviewType, scheduledDate, scheduledTime, location, meetingLink, notes } = req.body;

        const query = `
            INSERT INTO interviews 
            (application_id, interview_type, scheduled_date, scheduled_time, location, meeting_link, notes, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled')
        `;

        await db.query(query, [
            applicationId,
            interviewType,
            scheduledDate,
            scheduledTime,
            location || null,
            meetingLink || null,
            notes || null
        ]);

        res.json({ success: true, message: 'Interview scheduled' });
    } catch (error) {
        console.error('Error scheduling interview:', error);
        res.status(500).json({ message: 'Error scheduling interview' });
    }
};

// Get interviews
exports.getInterviews = async (req, res) => {
    try {
        const query = `
            SELECT 
                i.*,
                a.user_id,
                u.name as candidate_name,
                j.title as job_title
            FROM interviews i
            JOIN applications a ON i.application_id = a.id
            JOIN users u ON a.user_id = u.id
            JOIN jobs j ON a.job_id = j.id
            ORDER BY i.scheduled_date DESC
        `;

        const [interviews] = await db.query(query);
        res.json(interviews);
    } catch (error) {
        console.error('Error fetching interviews:', error);
        res.status(500).json({ message: 'Error fetching interviews' });
    }
};

// Add interview feedback
exports.addFeedback = async (req, res) => {
    try {
        const { interviewId } = req.params;
        const { communicationScore, technicalScore, cultureFitScore, strengths, weaknesses, recommendation } = req.body;

        const query = `
            INSERT INTO interview_feedback 
            (interview_id, communication_score, technical_score, culture_fit_score, strengths, weaknesses, recommendation)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        await db.query(query, [
            interviewId,
            communicationScore,
            technicalScore,
            cultureFitScore,
            strengths,
            weaknesses,
            recommendation
        ]);

        // Update interview status to completed
        await db.query('UPDATE interviews SET status = ? WHERE id = ?', ['completed', interviewId]);

        res.json({ success: true, message: 'Feedback added' });
    } catch (error) {
        console.error('Error adding feedback:', error);
        res.status(500).json({ message: 'Error adding feedback' });
    }
};

// Update interview
exports.updateInterview = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, scheduledDate, scheduledTime, location, meetingLink, notes } = req.body;

        const query = `
            UPDATE interviews 
            SET status = ?, scheduled_date = ?, scheduled_time = ?, location = ?, meeting_link = ?, notes = ?
            WHERE id = ?
        `;

        await db.query(query, [status, scheduledDate, scheduledTime, location, meetingLink, notes, id]);
        res.json({ success: true, message: 'Interview updated' });
    } catch (error) {
        console.error('Error updating interview:', error);
        res.status(500).json({ message: 'Error updating interview' });
    }
};

// Cancel interview
exports.cancelInterview = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('UPDATE interviews SET status = ? WHERE id = ?', ['cancelled', id]);
        res.json({ success: true, message: 'Interview cancelled' });
    } catch (error) {
        console.error('Error cancelling interview:', error);
        res.status(500).json({ message: 'Error cancelling interview' });
    }
};
