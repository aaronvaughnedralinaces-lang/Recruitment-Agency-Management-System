const mysql = require('mysql2/promise');
const { URL } = require('url');

// Only load .env if not in production (allow Railway env vars to take precedence)
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

/**
 * Database Initialization Script
 * Run this to create all required tables on Railway MySQL
 * 
 * Usage:
 *   npm run init-db
 * 
 * Make sure MYSQL_URL is set, or DB_HOST, DB_USER, DB_PASSWORD, DB_NAME in .env or Railway variables
 */

async function initializeDatabase() {
    let connectionConfig;
    
    // In production, use the MYSQL_URL connection string from Railway
    if (process.env.MYSQL_URL) {
        const dbUrl = new URL(process.env.MYSQL_URL);
        connectionConfig = {
            host: dbUrl.hostname,
            user: dbUrl.username,
            password: dbUrl.password,
            database: dbUrl.pathname.slice(1), // Remove leading slash
            port: dbUrl.port || 3306,
        };
    } else {
        // Development: use individual environment variables
        connectionConfig = {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        };
    }

    const connection = await mysql.createConnection(connectionConfig);

    try {
        console.log('🔄 Starting database initialization...\n');

        // Create users table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('admin', 'employer', 'jobseeker', 'deployment_officer') DEFAULT 'jobseeker',
                bio TEXT,
                status VARCHAR(50) DEFAULT 'active',
                company_id INT,
                last_login DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX (email),
                INDEX (role)
            )
        `);
        console.log('✓ Created users table');

        // Create companies table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS companies (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                logo VARCHAR(255),
                location VARCHAR(255),
                website VARCHAR(255),
                contact_email VARCHAR(255),
                contact_phone VARCHAR(20),
                verified_status ENUM('verified', 'unverified', 'pending') DEFAULT 'unverified',
                created_at DATETIME,
                updated_at DATETIME,
                INDEX (name)
            )
        `);
        console.log('✓ Created companies table');

        // Create jobs table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS jobs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                company_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                location VARCHAR(255),
                salary_range VARCHAR(100),
                posted_date DATETIME,
                status VARCHAR(50) DEFAULT 'open',
                created_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
                INDEX (company_id),
                INDEX (status)
            )
        `);
        console.log('✓ Created jobs table');

        // Create tags table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS tags (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                INDEX (name)
            )
        `);
        console.log('✓ Created tags table');

        // Create job_tags table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS job_tags (
                job_id INT NOT NULL,
                tag_id INT NOT NULL,
                PRIMARY KEY (job_id, tag_id),
                FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
                FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
            )
        `);
        console.log('✓ Created job_tags table');

        // Create education table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS education (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                institution VARCHAR(255),
                degree VARCHAR(100),
                field VARCHAR(100),
                start_date DATE,
                end_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ Created education table');

        // Create career table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS career (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                company_name VARCHAR(255),
                position VARCHAR(255),
                description TEXT,
                start_date DATE,
                end_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ Created career table');

        // Create documents table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS documents (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                company_id INT,
                document_name VARCHAR(255),
                document_path VARCHAR(255),
                document_type VARCHAR(50),
                uploaded_date DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ Created documents table');

        console.log('\n✅ Database initialization complete!');
        console.log('All tables have been created successfully.\n');

    } catch (error) {
        console.error('❌ Error during database initialization:');
        console.error(error.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

// Run the initialization
initializeDatabase().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
