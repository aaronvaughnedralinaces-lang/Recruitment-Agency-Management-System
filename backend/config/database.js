const mysql = require('mysql2');
const { URL } = require('url');

// Only load .env in development - allow Railway env vars to take precedence in production
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

let dbConfig;

// In production, use the MYSQL_URL connection string from Railway
if (process.env.MYSQL_URL) {
    const dbUrl = new URL(process.env.MYSQL_URL);
    dbConfig = {
        host: dbUrl.hostname,
        user: dbUrl.username,
        password: dbUrl.password,
        database: dbUrl.pathname.slice(1), // Remove leading slash
        port: dbUrl.port || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    };
} else {
    // Development: use individual environment variables
    dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'rams_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    };
}

console.log('[DB Config]', {
    host: dbConfig.host,
    user: dbConfig.user,
    database: dbConfig.database,
    port: dbConfig.port || 3306,
    hasPassword: !!dbConfig.password,
    usingMYSQL_URL: !!process.env.MYSQL_URL
});

if (!process.env.DB_HOST && !process.env.MYSQL_URL && process.env.NODE_ENV === 'production') {
    console.error('[CRITICAL] Neither MYSQL_URL nor DB_HOST environment variables are set. Please configure Railway environment variables.');
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