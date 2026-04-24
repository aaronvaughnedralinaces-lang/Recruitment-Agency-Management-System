const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Only load .env in development - allow Railway env vars to take precedence in production
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

// Import route modules
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const companyRoutes = require('./routes/companyRoutes');
const jobRoutes = require('./routes/jobRoutes');
const adminRoutes = require('./routes/adminRoutes');
const locationRoutes = require('./routes/locationRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reportRoutes = require('./routes/reportRoutes');
const screeningRoutes = require('./routes/screeningRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const publicRoutes = require('./routes/publicRoutes');
const errorHandler = require('./middleware/errorHandler');

// Import DB connection
require('./config/database');

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());

// Serve uploaded files statically
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint (no auth required)
app.get('/api/health', async (req, res) => {
    try {
        const db = require('./config/database');
        await db.query('SELECT 1');
        res.json({ status: 'ok', message: 'Database connected' });
    } catch (err) {
        res.status(503).json({ status: 'error', message: 'Database connection failed: ' + err.message });
    }
});

// Mount routes
/*app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', companyRoutes);
app.use('/api', jobRoutes);*/
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/company', companyRoutes); // <-- Make sure it looks exactly like this
app.use('/api/jobs', jobRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/location', locationRoutes);   // <-- NOW locationRoutes is defined
app.use('/api/applications', applicationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/screening', screeningRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/public', publicRoutes);  // Public endpoints (no auth required)

app.use('/api', (req, res) => {
    res.status(404).json({ message: 'API route not found' });
});

// Go up one directory level to find the Vite 'dist' folder
const clientBuildPath = path.join(__dirname, '../dist');
app.use(express.static(clientBuildPath));

// Catch-all route to hand over routing to React Router
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// 404 handler
/*app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});*/

app.use(errorHandler);

module.exports = app;