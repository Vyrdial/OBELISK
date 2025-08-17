# OBELISK Profile Setup Guide

## 1. Database Setup

First, you need to run the SQL migration in your Supabase project:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the content from `supabase-migration.sql`
4. Click "Run" to create the profiles table

## 2. Creating a Profile Account

### Method 1: Sign Up Through the UI
1. Visit `http://localhost:3000`
2. Click "Begin your journey" to go to signup
3. Fill out the signup form with email and password
4. A cosmic profile will be automatically generated!

### Method 2: Use Browser Console (for testing)
1. Sign up/login first through the UI
2. Open browser developer tools (F12)
3. In the console, run:

```javascript
// Import the test functions
const { createTestProfile, getCurrentUserProfile, regenerateCurrentUserIdentity } = await import('/src/lib/testProfile.ts')

// Create or view current profile
await createTestProfile()

// View current profile
await getCurrentUserProfile()

// Regenerate cosmic identity (new username/display name)
await regenerateCurrentUserIdentity()
```

## 3. Features Implemented

### Authentication Features:
- ✅ Email/password authentication
- ✅ Google OAuth (configured but needs OAuth setup in Supabase)
- ✅ Discord OAuth (configured but needs OAuth setup in Supabase)
- ✅ Automatic profile creation on signup
- ✅ Protected routes (redirects to login if not authenticated)
- ✅ Landing page redirect (redirects to dashboard if already signed in)

### Profile Features:
- ✅ Randomized cosmic usernames (e.g., `stellar_wanderer_0001`)
- ✅ Randomized display names (e.g., `Stellar Wanderer`) 
- ✅ Randomized cosmic titles (e.g., `Stellar Wanderer of the Void`)
- ✅ XP and Stardust tracking
- ✅ Evolution stages (starts at "Sand")
- ✅ Achievement system (starts with "First Steps")
- ✅ Profile display in constellation header
- ✅ Sign out functionality

## 4. Profile Examples

Here are some example profiles the system generates:

```
Username: quantum_seeker_7829
Display Name: Quantum Seeker  
Cosmic Title: Quantum Seeker of the Multiverse

Username: ethereal_navigator_2156
Display Name: Ethereal Navigator
Cosmic Title: Ethereal Navigator of the Aurora

Username: prismatic_sage_9043
Display Name: Prismatic Sage
Cosmic Title: Prismatic Sage of Infinity
```

## 5. Testing the System

1. **Test Landing Page Redirect:**
   - Sign in, then try to visit `/` - should redirect to `/constellations`

2. **Test Protected Routes:**
   - Sign out, then try to visit `/constellations` - should redirect to `/auth/login`

3. **Test Profile Display:**
   - After signing in, hover over the user icon in the constellation header
   - Should show your cosmic identity

4. **Test Profile Data:**
   - Check that stardust shows in the header (starts at 100)
   - Check that XP shows in the header (starts at 0)

## 6. Database Schema

The profiles table includes:
- `user_id` (references auth.users)
- `username` (unique cosmic username)
- `display_name` (readable cosmic name)
- `cosmic_title` (full cosmic title)
- `xp` (experience points)
- `stardust` (cosmic currency)
- `evolution_stage` (progression level)
- `unlocked_cosmetics` (array of unlocked items)
- `achievements` (array of earned achievements)

## 7. Next Steps

- Set up OAuth providers in Supabase for Google/Discord login
- Add profile editing functionality
- Integrate profile data with the mass system
- Add more achievement types
- Create profile customization options

The system is now fully functional with automatic cosmic identity generation!