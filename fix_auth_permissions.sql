-- Fix Authentication Permissions for Account Deletion and Email Verification
-- Run this in your Supabase SQL editor

-- 1. Ensure RLS is enabled on all tables
ALTER TABLE api.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.constellations ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.mass_system_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.user_achievements ENABLE ROW LEVEL SECURITY;

-- 2. Create or update RLS policies for profiles table
-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON api.profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON api.profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own profile
CREATE POLICY "Users can delete own profile" ON api.profiles
    FOR DELETE USING (auth.uid() = user_id);

-- 3. Create or update RLS policies for other tables to allow deletion
-- Constellations
CREATE POLICY "Users can delete own constellations" ON api.constellations
    FOR DELETE USING (auth.uid() = user_id);

-- User lesson progress
CREATE POLICY "Users can delete own progress" ON api.user_lesson_progress
    FOR DELETE USING (auth.uid() = user_id);

-- Mass system state
CREATE POLICY "Users can delete own mass state" ON api.mass_system_state
    FOR DELETE USING (auth.uid() = user_id);

-- User achievements
CREATE POLICY "Users can delete own achievements" ON api.user_achievements
    FOR DELETE USING (auth.uid() = user_id);

-- 4. Grant necessary permissions to authenticated users
GRANT DELETE ON api.profiles TO authenticated;
GRANT DELETE ON api.constellations TO authenticated;
GRANT DELETE ON api.user_lesson_progress TO authenticated;
GRANT DELETE ON api.mass_system_state TO authenticated;
GRANT DELETE ON api.user_achievements TO authenticated;

-- 5. Create a function to handle user deletion (optional but recommended)
CREATE OR REPLACE FUNCTION api.delete_user_data()
RETURNS void AS $$
BEGIN
    -- Delete all user data
    DELETE FROM api.profiles WHERE user_id = auth.uid();
    DELETE FROM api.constellations WHERE user_id = auth.uid();
    DELETE FROM api.user_lesson_progress WHERE user_id = auth.uid();
    DELETE FROM api.mass_system_state WHERE user_id = auth.uid();
    DELETE FROM api.user_achievements WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION api.delete_user_data() TO authenticated;

-- 6. Ensure proper auth configuration
-- Note: These settings need to be configured in Supabase Dashboard, not SQL
-- Go to Authentication > URL Configuration and add:
-- - https://obelisk.codes/auth/callback
-- - http://localhost:3000/auth/callback
-- - https://*.vercel.app/auth/callback (if using Vercel preview deployments)

-- 7. Add any missing columns if they don't exist
-- Check if account_deleted exists in auth.users metadata
-- This is handled by Supabase auth, but we can create a trigger to log deletions

-- Create a table to log account deletions (optional)
CREATE TABLE IF NOT EXISTS api.account_deletions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deletion_reason TEXT,
    deletion_errors JSONB
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_account_deletions_user_id ON api.account_deletions(user_id);

-- 8. Drop any conflicting policies (run only if you get policy exists errors)
-- DROP POLICY IF EXISTS "Users can view own profile" ON api.profiles;
-- DROP POLICY IF EXISTS "Users can update own profile" ON api.profiles;
-- DROP POLICY IF EXISTS "Users can delete own profile" ON api.profiles;
-- DROP POLICY IF EXISTS "Users can delete own constellations" ON api.constellations;
-- DROP POLICY IF EXISTS "Users can delete own progress" ON api.user_lesson_progress;
-- DROP POLICY IF EXISTS "Users can delete own mass state" ON api.mass_system_state;
-- DROP POLICY IF EXISTS "Users can delete own achievements" ON api.user_achievements;

-- Then re-run the CREATE POLICY statements above