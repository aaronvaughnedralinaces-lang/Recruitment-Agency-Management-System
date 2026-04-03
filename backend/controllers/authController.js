const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { splitName } = require('../utils/helpers');

exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const existing = await User.findByEmail(email);
        if (existing) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const { first_name, last_name } = splitName(name);
        
        let insertRole = 'jobseeker';
        if (role === 'employer') insertRole = 'employer';
        else if (role === 'deployment_officer') insertRole = 'deployment_officer';
        else if (role === 'admin') insertRole = 'admin';

        const userId = await User.create({
            first_name,
            last_name,
            email,
            password_hash: hashedPassword,
            role: insertRole,
            status: 'active'
        });

        const token = jwt.sign(
            { id: userId, email, name, role: insertRole },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: userId,
                name: `${first_name} ${last_name}`.trim(),
                email,
                role: insertRole,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        await User.updateLastLogin(user.id);

        const fullName = `${user.first_name} ${user.last_name}`.trim();
        const token = jwt.sign(
            { id: user.id, email: user.email, name: fullName, role: user.role, first_name: user.first_name, last_name: user.last_name },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: fullName,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};