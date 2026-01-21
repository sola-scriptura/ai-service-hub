# Sign-Up Hanging - QUICK FIX REFERENCE

## ⚡ Immediate Checks

### 1. Open Browser Console (F12)
Look for these logs when you click "Create Account":

```
✅ GOOD - Complete flow:
[SignUpForm] Starting sign up process...
[authApi.signUp] Starting sign up for: ...
[authApi.signUp] Response received
[authApi.signUp] Sign up completed successfully
[SignUpForm] Sign up completed

❌ BAD - Hangs at:
[authApi.signUp] Calling supabase.auth.signUp...
(nothing after this = network/config issue)
```

### 2. Check Environment Variables

```bash
# .env file must have:
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

**Missing or wrong?** → Button will hang

### 3. Disable Email Confirmation (Dev Only)

**Supabase Dashboard:**
1. Authentication → Providers → Email
2. Uncheck "Confirm email"
3. Save

**Why?** Email confirmation causes "hanging" appearance (it's actually waiting for email)

---

## 🔍 What Each Log Means

| Log | Meaning | Next Step |
|-----|---------|-----------|
| `Starting sign up process` | Form submitted | ✅ Good |
| `Calling supabase.auth.signUp` | Calling Supabase | Wait for response |
| `Response received` | Supabase responded | ✅ Good |
| `User: abc-123` | User created | ✅ Good |
| `Session: exists` | Can sign in now | ✅ Good |
| `Session: null` | Email confirmation needed | ⚠️ Check email |
| `Email confirmation required: true` | Must confirm email | ⚠️ Expected |
| `Profile created successfully` | Profile ready | ✅ Good |
| `Sign up completed` | Done | ✅ Good |

---

## 🚨 Common Problems

### Problem: No logs at all
**Cause:** JavaScript error
**Fix:** Check console for red errors

### Problem: Stops at "Calling supabase.auth.signUp"
**Cause:** Network issue or wrong credentials
**Fix:** 
- Check .env file
- Verify Supabase project is active
- Check internet connection

### Problem: "Profile creation error"
**Cause:** RLS policy missing
**Fix:** Run `supabase/fix-rls-policies.sql`
**Note:** Sign up still works! Profile created on sign in

### Problem: Success message but can't sign in
**Cause:** Email confirmation enabled
**Fix:** Check email or disable confirmation

---

## ✅ Expected Behaviors

### With Email Confirmation DISABLED (Dev)
1. Click "Create Account"
2. See "Account created successfully!"
3. Modal closes after 1.5s
4. User signed in automatically
5. Header shows user name

### With Email Confirmation ENABLED (Prod)
1. Click "Create Account"
2. See "Account created! Please check your email..."
3. Form clears, modal stays open
4. Check email for confirmation link
5. Click link, then sign in

---

## 🛠️ Quick Fixes

### Fix 1: Restart Dev Server
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Fix 2: Clear Browser Cache
```
Ctrl+Shift+Delete → Clear cache
```

### Fix 3: Check Supabase Status
```
Visit: https://status.supabase.com
```

### Fix 4: Verify RLS Policies
```sql
-- Run in Supabase SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'profiles';
-- Should see INSERT policy
```

---

## 📋 Testing Checklist

- [ ] Console shows complete log flow
- [ ] Loading state clears (button not stuck)
- [ ] Success or error message appears
- [ ] No red errors in console
- [ ] Profile created in database (check Supabase)

---

## 🆘 Still Stuck?

1. **Copy all console logs** from sign up attempt
2. **Check** `DEBUG_SIGNUP.md` for detailed guide
3. **Verify** `.env` file has correct values
4. **Run** `supabase/fix-rls-policies.sql`
5. **Disable** email confirmation for testing

---

## 📚 Related Docs

- `DEBUG_SIGNUP.md` - Detailed debugging guide
- `SUPABASE_DEV_SETUP.md` - Email confirmation setup
- `PHASE3_FIXES.md` - All authentication fixes
- `supabase/fix-rls-policies.sql` - RLS policy fix
