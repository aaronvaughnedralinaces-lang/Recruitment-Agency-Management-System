const User = require('../models/User');
const Career = require('../models/Career');
const Education = require('../models/Education');

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch data and ensure they default to an empty array if null/undefined
        const career = await Career.findByUserId(userId) || [];
        const education = await Education.findByUserId(userId) || [];

        res.json({
            user: {
                id: user.id,
                // CHANGED: Send these separately to match your DB and new Frontend Interface
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                bio: user.bio || ''
            },
            career,
            education
        });
    } catch (err) {
        console.error("Backend Error in getProfile:", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.updateBio = async (req, res) => {
    const { bio } = req.body;
    try {
        await User.updateBio(req.user.id, bio);
        res.json({ message: 'Bio updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Career
exports.addCareer = async (req, res) => {
    const { job_title, company_name, start_date, end_date, description } = req.body;
    try {
        await Career.create(req.user.id, { job_title, company_name, start_date, end_date, description });
        res.status(201).json({ message: 'Career entry added' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateCareer = async (req, res) => {
    const { job_title, company_name, start_date, end_date, description } = req.body;
    try {
        const affected = await Career.update(req.params.id, req.user.id, { job_title, company_name, start_date, end_date, description });
        if (affected === 0) return res.status(404).json({ message: 'Entry not found' });
        res.json({ message: 'Career entry updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteCareer = async (req, res) => {
    try {
        const affected = await Career.delete(req.params.id, req.user.id);
        if (affected === 0) return res.status(404).json({ message: 'Entry not found' });
        res.json({ message: 'Career entry deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Education
exports.addEducation = async (req, res) => {
    const { qualification, institution, completion_date, highlights } = req.body;
    try {
        await Education.create(req.user.id, { qualification, institution, completion_date, highlights });
        res.status(201).json({ message: 'Education added' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateEducation = async (req, res) => {
    const { qualification, institution, completion_date, highlights } = req.body;
    try {
        const affected = await Education.update(req.params.id, req.user.id, { qualification, institution, completion_date, highlights });
        if (affected === 0) return res.status(404).json({ message: 'Entry not found' });
        res.json({ message: 'Education updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteEducation = async (req, res) => {
    try {
        const affected = await Education.delete(req.params.id, req.user.id);
        if (affected === 0) return res.status(404).json({ message: 'Entry not found' });
        res.json({ message: 'Education deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};