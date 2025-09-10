// Simple in-memory authentication for testing
// This replaces the database authentication temporarily

class SimpleAuth {
    constructor() {
        this.users = new Map();
        this.sessions = new Map();
        this.nextUserId = 1;
    }

    async createUser(userData) {
        const { name, email, password, provider = 'email' } = userData;
        
        // Check if user already exists
        for (let user of this.users.values()) {
            if (user.email === email) {
                throw new Error('User already exists with this email');
            }
        }
        
        const user = {
            id: this.nextUserId++,
            name,
            email,
            password: password ? await this.hashPassword(password) : null,
            provider,
            picture_url: null,
            created_at: new Date().toISOString()
        };
        
        this.users.set(user.id, user);
        return user;
    }

    async findUserByEmail(email) {
        for (let user of this.users.values()) {
            if (user.email === email) {
                return user;
            }
        }
        return null;
    }

    async findUserByGoogleId(googleId) {
        for (let user of this.users.values()) {
            if (user.google_id === googleId) {
                return user;
            }
        }
        return null;
    }

    async verifyPassword(user, password) {
        if (!user.password) return false;
        return await this.hashPassword(password) === user.password;
    }

    async hashPassword(password) {
        // Simple hash for demo purposes
        return Buffer.from(password).toString('base64');
    }

    generateToken(user) {
        // Simple token for demo purposes
        return Buffer.from(JSON.stringify({
            id: user.id,
            email: user.email,
            exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
        })).toString('base64');
    }

    verifyToken(token) {
        try {
            const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
            if (decoded.exp < Date.now()) {
                return null; // Token expired
            }
            return decoded;
        } catch (error) {
            return null;
        }
    }
}

module.exports = SimpleAuth;
