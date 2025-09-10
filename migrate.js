const { query, initializeDatabase } = require('./database/connection');

async function migrate() {
    try {
        console.log('Starting database migration...');
        console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
        
        // First, try to initialize the database schema
        await initializeDatabase();
        console.log('✓ Database schema initialized');
        
        // Add user_id column to characters table if it doesn't exist
        try {
            await query(`
                ALTER TABLE characters 
                ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE
            `);
            console.log('✓ User_id column added to characters table');
        } catch (error) {
            if (error.message.includes('already exists') || error.message.includes('column "user_id" already exists')) {
                console.log('✓ User_id column already exists in characters table');
            } else {
                console.log('Note: Could not add user_id column:', error.message);
            }
        }
        
        // Create additional indexes
        try {
            await query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
            await query(`CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)`);
            await query(`CREATE INDEX IF NOT EXISTS idx_characters_user_id ON characters(user_id)`);
            console.log('✓ Indexes created');
        } catch (error) {
            console.log('Note: Some indexes may already exist:', error.message);
        }
        
        console.log('Database migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        console.error('Error details:', error.message);
        process.exit(1);
    }
}

migrate();
