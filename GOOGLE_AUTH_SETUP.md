# Google OAuth Setup Guide

## Problem
Google authentication is not working because the client ID is not configured.

## Solution

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" in the left sidebar
5. Click "Create Credentials" → "OAuth 2.0 Client IDs"
6. Choose "Web application"
7. Add your domain to "Authorized JavaScript origins":
   - For development: `http://localhost:3000`
   - For production: `https://yourdomain.com`
8. Copy the Client ID

### 2. Update the Application

Replace `YOUR_GOOGLE_CLIENT_ID` in `/public/auth.js` with your actual client ID:

```javascript
google.accounts.id.initialize({
    client_id: 'your-actual-client-id-here.apps.googleusercontent.com',
    callback: this.handleGoogleCallback.bind(this),
    auto_select: false,
    cancel_on_tap_outside: true
});
```

### 3. Add Google Script to HTML

Add this script tag to your `index.html` before the closing `</body>` tag:

```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

### 4. Environment Variables (Optional)

For better security, you can store the client ID in environment variables:

1. Create a `.env` file in your project root:
```
GOOGLE_CLIENT_ID=your-actual-client-id-here.apps.googleusercontent.com
```

2. Update the server to serve the client ID:
```javascript
app.get('/api/config', (req, res) => {
    res.json({
        googleClientId: process.env.GOOGLE_CLIENT_ID
    });
});
```

3. Update the frontend to fetch the client ID:
```javascript
async initializeGoogleAuth() {
    try {
        const response = await fetch('/api/config');
        const config = await response.json();
        
        if (typeof google !== 'undefined') {
            google.accounts.id.initialize({
                client_id: config.googleClientId,
                callback: this.handleGoogleCallback.bind(this),
                auto_select: false,
                cancel_on_tap_outside: true
            });
        }
    } catch (error) {
        console.error('Failed to load Google config:', error);
    }
}
```

## Testing

After setup, Google authentication should work properly. Users will be able to:
- Sign in with Google
- Have their characters saved to the database
- Access their characters from any device
