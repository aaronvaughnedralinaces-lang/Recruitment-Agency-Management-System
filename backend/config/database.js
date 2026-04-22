const mysql = require('mysql2');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'rams_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

console.log('[DB Config]', {
    host: dbConfig.host,
    user: dbConfig.user,
    database: dbConfig.database,
    port: dbConfig.port || 3306,
    hasPassword: !!dbConfig.password
});

if (!process.env.DB_HOST && process.env.NODE_ENV === 'production') {
    console.error('[CRITICAL] DB_HOST environment variable is not set. Please configure Railway environment variables.');
}

const pool = mysql.createPool(dbConfig);

// Promisify pool for async/await usage
const promisePool = pool.promise();

// Test connection on startup
promisePool.query('SELECT 1')
    .then(() => console.log('[DB] ✓ Connection test successful'))
    .catch(err => {
        console.error('[DB] ✗ Connection test FAILED:', err.message);
        console.error('[DB] Ensure these environment variables are set:');
        console.error('[DB]   - DB_HOST (required)');
        console.error('[DB]   - DB_USER (required)');
        console.error('[DB]   - DB_PASSWORD (optional)');
    });

module.exports = promisePool;