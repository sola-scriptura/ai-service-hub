# Sign-Up Hanging at Supabase Call - DEBUG GUIDE

## Current Situation

Console stops at:
```
[authApi.signUp] Step 1: Calling supabase.auth.signUp...
```

This means the Supabase `auth.signUp()` call itself is not returning.

---

## Immediate Debugging Steps

### Step 1: Check Environment Variables

**Open `.env` file and verify:**
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

**Check in console:**
```javascript
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
```

**Common issues:**
- Missing `VITE_` prefix
- Trailing spaces
- Wrong project URL
- Expired or wrong anon key

### Step 2: Restart Dev Server

After changing `.env`:
```bash
# Stop server (Ctrl+C)
npm run dev
```

Environment variables are only loaded on server start.

### Step 3: Check Supabase Project Status

1. Go to https://supabase.com/dashboard
2. Select your project
3. Check if project is active (not paused)
4. Check if there are any service issues

### Step 4: Test Network Connection

**In browser console:**
```javascript
fetch('https://your-project.supabase.co/rest/v1/')
  .then(r => console.log('Supabase reachable:', r.status))
  .catch(e => console.error('Cannot reach Supabase:', e));
```

### Step 5: Direct Supabase Test

**In browser console:**
```javascript
// Import the test function
import { testSupabaseSignUp } from './src/services/testSupabaseSignUp';

// Run test
testSupabaseSignUp('test@example.com', 'password123');
```

This bypasses all our code and tests Supabase directly.

---

## What the New Logging Will Show

### If Supabase Responds (Good)
```
[authApi.signUp] - Promise created, awaiting response...
[authApi.signUp] Step 2: *** SUPABASE RESPONDED ***
[authApi.signUp] - Response data: {...}
```

### If Supabase Times Out (30 seconds)
```
[authApi.signUp] - Promise created, awaiting response...
[authApi.signUp] TIMEOUT: Supabase call exceeded 30 seconds
[authApi.signUp] ===== SIGN UP FAILED =====
```

### If Network Error
```
[authApi.signUp] ===== SIGN UP FAILED =====
[authApi.signUp] Unexpected error: NetworkError
```

---

## Common Causes & Solutions

### 1. Wrong Environment Variables

**Symptoms:**
- Hangs indefinitely
- No timeout error
- No network error

**Solution:**
```bash
# Check .env file
cat .env

# Verify variables start with VITE_
# Restart dev server after changes
```

### 2. Supabase Project Paused

**Symptoms:**
- Hangs for 30 seconds
- Then timeout error

**Solution:**
1. Go to Supabase dashboard
2. Check project status
3. Unpause if needed

### 3. Network/Firewall Issue

**Symptoms:**
- Hangs indefinitely
- Cannot reach Supabase URL

**Solution:**
- Check internet connection
- Check firewall settings
- Try different network
- Check VPN if using one

### 4. CORS Issue (Unlikely)

**Symptoms:**
- CORS error in console
- Supabase call blocked

**Solution:**
1. Go to Supabase Dashboard
2. Settings → API
3. Check allowed origins
4. Add `http://localhost:5173` if missing

### 5. Invalid Anon Key

**Symptoms:**
- Immediate error
- "Invalid API key" message

**Solution:**
1. Go to Supabase Dashboard
2. Settings → API
3. Copy anon/public key
4. Update .env file
5. Restart dev server

---

## Testing Checklist

Run these tests in order:

- [ ] **Test 1:** Check .env file exists and has correct format
- [ ] **Test 2:** Restart dev server
- [ ] **Test 3:** Check console for environment variables
- [ ] **Test 4:** Test network connection to Supabase
- [ ] **Test 5:** Run direct Supabase test
- [ ] **Test 6:** Try sign up again with new logging
- [ ] **Test 7:** Wait for timeout (30 seconds) to see error

---

## Expected Behavior After Fixes

### Successful Sign-Up
```
[authApi.signUp] Step 1: Calling supabase.auth.signUp...
[authApi.signUp] - Promise created, awaiting response...
[authApi.signUp] Step 2: *** SUPABASE RESPONDED ***
[authApi.signUp] - User ID: abc-123-def
[authApi.signUp] - Session exists: true
[authApi.signUp] Step 3: User created successfully
[authApi.signUp] Step 4: Attempting profile creation...
[authApi.signUp] - Profile created successfully
[authApi.signUp] ===== SIGN UP COMPLETE =====
```

### Timeout Error
```
[authApi.signUp] Step 1: Calling supabase.auth.signUp...
[authApi.signUp] - Promise created, awaiting response...
(wait 30 seconds)
[authApi.signUp] TIMEOUT: Supabase call exceeded 30 seconds
[authApi.signUp] ===== SIGN UP FAILED =====
[SignUpForm] Error: Sign up timed out after 30 seconds...
```

---

## Quick Fixes to Try

### Fix 1: Regenerate Supabase Keys
1. Supabase Dashboard → Settings → API
2. Click "Reset" on anon key
3. Copy new key to .env
4. Restart dev server

### Fix 2: Create New Test User in Supabase
1. Supabase Dashboard → Authentication → Users
2. Click "Add user"
3. Create manually
4. Try signing in with that user

### Fix 3: Check Supabase Logs
1. Supabase Dashboard → Logs
2. Look for sign-up attempts
3. Check for errors

### Fix 4: Disable All Browser Extensions
- Ad blockers can interfere
- Privacy extensions can block requests
- Try incognito mode

---

## If Still Hanging After All Fixes

**Collect this information:**

1. **Console output** (all logs)
2. **Network tab** (F12 → Network)
   - Look for requests to Supabase
   - Check if they're pending/failed
3. **Environment variables** (redact sensitive parts)
4. **Supabase project region**
5. **Browser and version**
6. **Operating system**

**Then:**
- Check Supabase status page
- Check Supabase Discord/community
- File issue with Supabase support

---

## Next Steps

1. **Try the fixes above**
2. **Run direct Supabase test**
3. **Check console for new detailed logs**
4. **Wait for timeout to see if it's network issue**
5. **Report back with:**
   - Which step it stops at
   - Any new error messages
   - Network tab status

---

**The new logging and timeout will help us determine if this is:**
- ❌ Supabase configuration issue
- ❌ Network/connectivity issue  
- ❌ Supabase service issue
- ✅ Our code issue (unlikely since it stops at Supabase call)
