const { User } = require('./database/models');

async function testUserCreation() {
    try {
        console.log('Testing user creation...');
        
        const userData = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            provider: 'email'
        };
        
        console.log('Creating user with data:', { ...userData, password: '***' });
        
        const user = await User.create(userData);
        console.log('✅ User created successfully:', user);
        
        // Test password verification
        const isValidPassword = await User.verifyPassword(user, 'password123');
        console.log('✅ Password verification:', isValidPassword);
        
        // Test token generation
        const token = User.generateToken(user);
        console.log('✅ Token generated:', token ? 'Success' : 'Failed');
        
        // Test token verification
        const decoded = User.verifyToken(token);
        console.log('✅ Token verification:', decoded);
        
    } catch (error) {
        console.error('❌ Error:', error);
        console.error('Error details:', error.message);
        console.error('Stack:', error.stack);
    }
}

testUserCreation();
