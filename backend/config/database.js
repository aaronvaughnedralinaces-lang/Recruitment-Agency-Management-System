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

console.log('Database config:', {
    host: dbConfig.host,
    user: dbConfig.user,
    database: dbConfig.database,
    port: dbConfig.port || 3306
});

const pool = mysql.createPool(dbConfig);

// Promisify pool for async/await usage
const promisePool = pool.promise();

// Test connection on startup
promisePool.query('SELECT 1')
    .then(() => console.log('[DB] Connection test successful'))
    .catch(err => console.error('[DB] Connection test failed:', err.message));

module.exports = promisePool;