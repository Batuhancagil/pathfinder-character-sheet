const { query, initializeDatabase } = require('./database/connection');

async function testDatabase() {
    try {
        console.log('Testing database connection...');
        console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
        
        // Test basic connection
        const result = await query('SELECT NOW() as current_time');
        console.log('✓ Database connection successful');
        console.log('Current time:', result.rows[0].current_time);
        
        // Test if users table exists
        const tableCheck = await query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'users'
            );
        `);
        
        if (tableCheck.rows[0].exists) {
            console.log('✓ Users table exists');
        } else {
            console.log('⚠ Users table does not exist, running migration...');
            await initializeDatabase();
            console.log('✓ Database schema initialized');
        }
        
        console.log('Database test completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Database test failed:', error);
        console.error('Error details:', error.message);
        process.exit(1);
    }
}

testDatabase();
