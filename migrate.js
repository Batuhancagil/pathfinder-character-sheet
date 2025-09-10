const { query } = require('./database/connection');

async function migrate() {
    try {
        console.log('Starting database migration...');
        
        // Create users table
        await query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                google_id VARCHAR(255) UNIQUE,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255),
                picture_url VARCHAR(500),
                provider VARCHAR(50) DEFAULT 'email',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ Users table created/verified');
        
        // Add user_id column to characters table if it doesn't exist
        try {
            await query(`
                ALTER TABLE characters 
                ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE
            `);
            console.log('✓ User_id column added to characters table');
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('✓ User_id column already exists in characters table');
            } else {
                throw error;
            }
        }
        
        // Create indexes
        await query(`
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
        `);
        await query(`
            CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)
        `);
        await query(`
            CREATE INDEX IF NOT EXISTS idx_characters_user_id ON characters(user_id)
        `);
        console.log('✓ Indexes created');
        
        console.log('Database migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
