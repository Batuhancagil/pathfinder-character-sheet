# Configuration Guide

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/pathfinder_character_sheet

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Google OAuth Configuration
# Get this from Google Cloud Console
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Server Configuration
PORT=3000
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Choose "Web application"
6. Add authorized origins:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`
7. Copy the Client ID and add it to your `.env` file

## Database Setup

1. Install PostgreSQL
2. Create a database named `pathfinder_character_sheet`
3. Update the `DATABASE_URL` in your `.env` file
4. Run the application - it will automatically create the required tables

## Testing

After configuration:
1. Start the server: `npm start`
2. Visit `http://localhost:3000`
3. Try registering with email or Google
4. Import a character - it should save to the database
5. Log in from another device - your characters should be there
