const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import route modules
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const companyRoutes = require('./routes/companyRoutes');
const jobRoutes = require('./routes/jobRoutes');
const adminRoutes = require('./routes/adminRoutes');
const locationRoutes = require('./routes/locationRoutes');   // <-- ADD THIS LINE
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

// Mount routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', companyRoutes);
app.use('/api', jobRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/location', locationRoutes);   // <-- NOW locationRoutes is defined

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

module.exports = app;