# Logout Test Guide

## Test Steps

1. **Login and Import Characters:**
   - Log in to your account
   - Import some characters
   - Verify they appear in the character list

2. **Test Logout:**
   - Click the "Logout" button
   - Check that:
     - Login modal appears
     - Character list is empty
     - No characters are visible

3. **Test Login Again:**
   - Log in with the same account
   - Characters should reappear from the database

## What Should Happen

### ✅ Correct Behavior:
- **After Logout:** Character list should be completely empty
- **After Login:** Characters should load from database
- **No localStorage fallback:** Characters should not persist in localStorage when logged out

### ❌ Wrong Behavior:
- Characters still visible after logout
- Characters loaded from localStorage when not authenticated
- Import button works when not logged in

## Debug Commands

Open browser console and run:

```javascript
// Check if user is authenticated
console.log('Authenticated:', window.authManager.isUserAuthenticated());

// Check character count
console.log('Character count:', window.characterCardManager.importer.characters.length);

// Check localStorage
console.log('LocalStorage characters:', localStorage.getItem('pathfinder_characters'));

// Clear everything manually (if needed)
localStorage.clear();
window.characterCardManager.importer.characters = [];
window.characterCardManager.renderCharacterCards();
```

## Expected Console Output

**After Logout:**
```
User not authenticated - clearing characters
Final character count: 0
```

**After Login:**
```
Loading characters...
Auth manager available: true
User authenticated: true
Token available: true
Database response status: 200
Loaded characters from database: X
Final character count: X
```
