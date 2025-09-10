#!/bin/bash

# Set environment variables
export DATABASE_URL="postgresql://postgres:dmzshFjSistbAMyrqzQoMjUHIGRTSSqP@hopper.proxy.rlwy.net:40344/railway"
export JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Start the server
echo "Starting Pathfinder Character Sheet server..."
echo "Database URL: Set"
echo "JWT Secret: Set"
echo "Server starting on http://localhost:3000"
echo ""

node server.js
