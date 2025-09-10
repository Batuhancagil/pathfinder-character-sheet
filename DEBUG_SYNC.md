# Debug Character Synchronization

## Steps to Test Character Sync

1. **Open Browser Developer Tools** (F12)
2. **Go to Console tab**
3. **Refresh the page**
4. **Look for these log messages:**

```
CharacterImporter initialized
Loading characters...
Auth manager available: true
User authenticated: true
Token available: true
Database response status: 200
Loaded characters from database: X
Characters: [...]
Final character count: X
```

## If Characters Are Not Syncing

### Check 1: Authentication
- Look for "User authenticated: true" in console
- If false, you need to log in first

### Check 2: Database Connection
- Look for "Database response status: 200" in console
- If you see 401, the token is invalid
- If you see 500, there's a server error

### Check 3: Character Data
- Look for "Characters: [...]" in console
- This should show your character data from the database

## Manual Testing Steps

1. **On Computer 1:**
   - Log in with your account
   - Import a character
   - Check console logs to confirm it's saved to database

2. **On Computer 2:**
   - Log in with the same account
   - Click the "Refresh" button
   - Check console logs to see if characters are loaded from database

## Troubleshooting

### If you see "Loading from localStorage..." instead of database:
- The user is not authenticated
- Check if you're logged in
- Try logging out and logging back in

### If you see "Failed to load characters from database":
- Check server logs for errors
- Verify database connection
- Check if the character was actually saved to database

### If characters appear but don't sync:
- Check if both computers are using the same account
- Verify the character was saved to database (not just localStorage)
- Try the "Refresh" button on both computers

## Quick Fix Commands

Open browser console and run:

```javascript
// Check authentication status
console.log('Auth status:', window.authManager.isUserAuthenticated());
console.log('Token:', window.authManager.getToken());

// Manually refresh characters
window.characterCardManager.refreshCharacters();

// Check what's in localStorage
console.log('LocalStorage characters:', localStorage.getItem('pathfinder_characters'));
```
