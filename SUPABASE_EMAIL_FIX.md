# Supabase Email Redirect Fix

## The Issue
Even with `window.location.origin` in the code, Supabase emails might still redirect to localhost if the redirect URL isn't in Supabase's whitelist.

## Solution Steps:

### 1. Update Supabase Dashboard Settings

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. In the **Redirect URLs** section, add ALL of these URLs:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3001/auth/callback
   https://obelisk.codes/auth/callback
   https://*.vercel.app/auth/callback
   ```

### 2. Check Site URL Setting
In the same section, make sure **Site URL** is set to one of:
- `http://localhost:3000` (for development)
- `https://obelisk.codes` (for production)

### 3. Email Template (Optional)
If the above doesn't work, you might need to check:
1. Go to **Authentication** → **Email Templates**
2. Click on **Confirm signup**
3. Look for the redirect URL in the template - it might be hardcoded

### 4. Test the Fix
1. Clear your browser cache
2. Try signing up with a new email
3. The confirmation email should now redirect to the correct domain

## How It Works
- When signing up from `localhost:3000`, the email redirects to `localhost:3000/auth/callback`
- When signing up from `obelisk.codes`, the email redirects to `obelisk.codes/auth/callback`
- The `window.location.origin` in the code tells Supabase which URL to use
- But Supabase only allows redirects to URLs in its whitelist

## Still Not Working?
If emails still redirect to localhost, check:
1. Browser cache - try incognito mode
2. Make sure you deployed the latest code to production
3. Check if there's a `NEXT_PUBLIC_SITE_URL` env variable overriding the origin