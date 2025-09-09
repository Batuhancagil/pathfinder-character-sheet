const { Pool } = require('pg');
require('dotenv').config();

// Database connection configuration
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/pathfinder_chars',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test database connection
pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Initialize database schema
async function initializeDatabase() {
    try {
        const fs = require('fs');
        const path = require('path');
        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        
        await pool.query(schema);
        console.log('Database schema initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        // Don't exit in production, just log the error
        if (process.env.NODE_ENV !== 'production') {
            throw error;
        }
    }
}

// Database query helper
async function query(text, params) {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

// Close database connection
async function closeConnection() {
    await pool.end();
    console.log('Database connection closed');
}

module.exports = {
    pool,
    query,
    initializeDatabase,
    closeConnection
};
