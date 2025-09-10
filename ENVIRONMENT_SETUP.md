# Environment Setup

## Required Environment Variables

To run the Pathfinder Character Sheet application, you need to set these environment variables:

### 1. DATABASE_URL
```bash
export DATABASE_URL="postgresql://postgres:dmzshFjSistbAMyrqzQoMjUHIGRTSSqP@hopper.proxy.rlwy.net:40344/railway"
```

### 2. JWT_SECRET
```bash
export JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
```

## Quick Start

### Option 1: Use the start script
```bash
./start.sh
```

### Option 2: Set variables manually
```bash
export DATABASE_URL="postgresql://postgres:dmzshFjSistbAMyrqzQoMjUHIGRTSSqP@hopper.proxy.rlwy.net:40344/railway"
export JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
npm start
```

### Option 3: Create .env file
Create a `.env` file in the project root with:
```
DATABASE_URL=postgresql://postgres:dmzshFjSistbAMyrqzQoMjUHIGRTSSqP@hopper.proxy.rlwy.net:40344/railway
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## Features Working

✅ **Database**: Railway PostgreSQL connected
✅ **Authentication**: User registration and login
✅ **Character Storage**: User-specific character persistence
✅ **Session Management**: Multiplayer sessions
✅ **Modern UI**: Clean, responsive design

## Troubleshooting

If you get "Invalid JSON format" errors:
1. Make sure you're pasting valid Pathbuilder JSON
2. Check the browser console for detailed error messages
3. Ensure the JSON is complete and not truncated

If you get database connection errors:
1. Verify DATABASE_URL is set correctly
2. Check that Railway PostgreSQL service is running
3. Ensure your IP is whitelisted (if required)
