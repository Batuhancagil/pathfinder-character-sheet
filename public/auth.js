// Authentication Management
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
        this.initializeGoogleAuth();
    }

    setupEventListeners() {
        // Auth tab switching
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('auth-tab')) {
                this.switchAuthTab(e.target.dataset.auth);
            }
        });

        // Google Auth buttons
        document.addEventListener('click', (e) => {
            if (e.target.id === 'googleLoginBtn' || e.target.id === 'googleRegisterBtn') {
                this.handleGoogleAuth();
            }
        });

        // Email forms
        document.addEventListener('submit', (e) => {
            if (e.target.classList.contains('email-form')) {
                e.preventDefault();
                if (e.target.closest('#loginForm')) {
                    this.handleEmailLogin(e.target);
                } else if (e.target.closest('#registerForm')) {
                    this.handleEmailRegister(e.target);
                }
            }
        });

        // Logout button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'logoutBtn') {
                this.logout();
            }
        });
    }

    async initializeGoogleAuth() {
        try {
            // Fetch Google client ID from server
            const response = await fetch('/api/config');
            const config = await response.json();
            
            if (typeof google !== 'undefined') {
                google.accounts.id.initialize({
                    client_id: config.googleClientId,
                    callback: this.handleGoogleCallback.bind(this),
                    auto_select: false,
                    cancel_on_tap_outside: true
                });
                console.log('Google Auth initialized with client ID:', config.googleClientId);
            } else {
                // Retry after a short delay if Google hasn't loaded yet
                setTimeout(() => this.initializeGoogleAuth(), 100);
            }
        } catch (error) {
            console.error('Failed to initialize Google Auth:', error);
            // Retry after a short delay
            setTimeout(() => this.initializeGoogleAuth(), 1000);
        }
    }

    switchAuthTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.auth-tab').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-auth="${tab}"]`).classList.add('active');

        // Show/hide forms
        document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
        document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
    }

    async handleGoogleAuth() {
        try {
            if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
                google.accounts.id.prompt();
            } else {
                console.error('Google Auth not loaded');
                // For now, show a message about Google Auth setup
                alert('Google authentication requires setup. Please use email registration for now.');
            }
        } catch (error) {
            console.error('Google Auth error:', error);
            alert('Authentication failed. Please try again.');
        }
    }

    async handleGoogleCallback(response) {
        try {
            const responsePayload = this.decodeJwtResponse(response.credential);
            
            const userData = {
                id: responsePayload.sub,
                name: responsePayload.name,
                email: responsePayload.email,
                picture: responsePayload.picture,
                provider: 'google'
            };

            // Send to backend for verification/registration
            const result = await this.authenticateUser(userData);
            
            if (result.success) {
                this.setUser(result.user, result.token);
                this.hideAuthModal();
                await this.loadUserCharacters();
                // Refresh character cards if manager is available
                if (window.characterCardManager) {
                    await window.characterCardManager.refreshCharacters();
                }
            } else {
                alert('Authentication failed: ' + result.error);
            }
        } catch (error) {
            console.error('Google callback error:', error);
            alert('Authentication failed. Please try again.');
        }
    }

    decodeJwtResponse(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    }

    async handleEmailLogin(form) {
        const email = form.querySelector('#loginEmail').value;
        const password = form.querySelector('#loginPassword').value;

        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (response.ok) {
                this.setUser(result.user, result.token);
                this.hideAuthModal();
                await this.loadUserCharacters();
                // Refresh character cards if manager is available
                if (window.characterCardManager) {
                    await window.characterCardManager.refreshCharacters();
                }
            } else {
                alert('Login failed: ' + result.error);
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed. Please try again.');
        }
    }

    async handleEmailRegister(form) {
        const name = form.querySelector('#registerName').value;
        const email = form.querySelector('#registerEmail').value;
        const password = form.querySelector('#registerPassword').value;
        const confirmPassword = form.querySelector('#confirmPassword').value;

        if (!name || !email || !password || !confirmPassword) {
            alert('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password })
            });

            const result = await response.json();

            if (response.ok) {
                this.setUser(result.user, result.token);
                this.hideAuthModal();
                await this.loadUserCharacters();
                // Refresh character cards if manager is available
                if (window.characterCardManager) {
                    await window.characterCardManager.refreshCharacters();
                }
            } else {
                alert('Registration failed: ' + result.error);
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Registration failed. Please try again.');
        }
    }

    async authenticateUser(userData) {
        try {
            const response = await fetch('/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            return await response.json();
        } catch (error) {
            console.error('Authentication error:', error);
            return { success: false, error: 'Authentication failed' };
        }
    }

    setUser(user, token) {
        this.currentUser = user;
        this.isAuthenticated = true;
        
        // Update UI
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userMenu').style.display = 'flex';
        
        // Store in localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
        if (token) {
            localStorage.setItem('authToken', token);
        }
    }

    async checkAuthStatus() {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                this.setUser(user);
                this.hideAuthModal();
                await this.loadUserCharacters();
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('currentUser');
                localStorage.removeItem('authToken');
            }
        } else {
            this.showAuthModal();
        }
    }

    async loadUserCharacters() {
        if (!this.isAuthenticated) return;

        try {
            const response = await fetch('/api/characters', {
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });

            if (response.ok) {
                const characters = await response.json();
                // Update character manager with user's characters
                if (window.characterCardManager) {
                    window.characterCardManager.importer.characters = characters;
                    window.characterCardManager.renderCharacterCards();
                }
            }
        } catch (error) {
            console.error('Error loading user characters:', error);
        }
    }

    getToken() {
        return localStorage.getItem('authToken') || (this.currentUser && this.currentUser.token);
    }

    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        
        // Update UI
        document.getElementById('userMenu').style.display = 'none';
        
        // Clear localStorage
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        localStorage.removeItem('pathfinder_characters'); // Clear local character storage
        
        // Clear characters from manager
        if (window.characterCardManager) {
            window.characterCardManager.importer.characters = [];
            window.characterCardManager.renderCharacterCards();
        }
        
        // Show auth modal
        this.showAuthModal();
    }

    showAuthModal() {
        document.getElementById('authModal').style.display = 'flex';
    }

    hideAuthModal() {
        document.getElementById('authModal').style.display = 'none';
    }

    isUserAuthenticated() {
        return this.isAuthenticated;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

// Initialize auth manager
window.authManager = new AuthManager();
