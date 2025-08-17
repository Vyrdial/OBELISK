# Supabase Email Configuration

## Email Redirect Workaround (No Paid Plan Required!)

Since Supabase charges $10/month for custom domain email redirects, here's a free workaround:

### Solution:

Updated `AuthContext.tsx` to use `window.location.origin` for the redirect URL. This means:
- Users signing up from `obelisk.codes` → email redirects to `obelisk.codes`
- Users signing up from `localhost:3000` → email redirects to `localhost:3000`
- No custom domain configuration needed in Supabase!

### Code Change:

```javascript
emailRedirectTo: `${window.location.origin}/auth/callback`
```

### Supabase Dashboard Settings:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Add to **Redirect URLs** (whitelist all your domains):
   - `http://localhost:3000/auth/callback`
   - `https://obelisk.codes/auth/callback`
   - Any other domains you deploy to

### How It Works:

The email confirmation link will automatically redirect to whatever domain the user signed up from. This bypasses Supabase's custom domain limitation since we're not hardcoding a specific domain in their email templates.

### Note:

This approach works perfectly for most use cases and saves you $10/month! 🎉