# Supabase Development Setup

## Disable Email Confirmation for Localhost Testing

### Why?
During development, email confirmation can slow down testing. You can disable it temporarily.

### How to Disable (Supabase Dashboard)

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers** → **Email**
3. Find **"Confirm email"** setting
4. **Uncheck** "Confirm email"
5. Click **Save**

### What This Does
- Users can sign up and sign in immediately
- No email confirmation required
- Faster development and testing

### How to Re-Enable (Production)

**IMPORTANT:** Before deploying to production:

1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **Providers** → **Email**
3. **Check** "Confirm email"
4. Click **Save**

### Alternative: Email Templates

If you want to test email confirmation:

1. Go to **Authentication** → **Email Templates**
2. Configure SMTP settings (or use Supabase's default)
3. Test with a real email address

### Current Behavior

**With Email Confirmation Enabled:**
- User signs up
- Receives "Account created! Please check your email..."
- Must click confirmation link in email
- Then can sign in

**With Email Confirmation Disabled:**
- User signs up
- Receives "Account created successfully!"
- Can sign in immediately
- No email required

### Recommended for Development
✅ Disable email confirmation
✅ Use test email addresses
✅ Focus on building features

### Recommended for Production
✅ Enable email confirmation
✅ Configure custom email templates
✅ Set up custom SMTP (optional)
✅ Test thoroughly before launch

---

## Troubleshooting

**Issue:** Sign up hangs forever
- **Check:** Email confirmation is enabled
- **Solution:** Disable it for development

**Issue:** "Please confirm your email" but no email received
- **Check:** SMTP settings in Supabase
- **Solution:** Disable email confirmation for testing

**Issue:** Want to test email confirmation
- **Solution:** Use a real email address you can access
- **Solution:** Check spam folder
- **Solution:** Configure SMTP in Supabase

---

## Quick Reference

| Setting | Development | Production |
|---------|-------------|------------|
| Confirm Email | ❌ Disabled | ✅ Enabled |
| SMTP | Optional | Recommended |
| Email Templates | Default OK | Customize |
| Test Emails | Any format | Real only |
