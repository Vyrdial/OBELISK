-- Minimal Auth Fix - Only for existing tables
-- Run this in your Supabase SQL editor

-- 1. Enable RLS on profiles table (the main table that exists)
ALTER TABLE api.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON api.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON api.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON api.profiles;

-- 3. Create RLS policies for profiles table
-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON api.profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON api.profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own profile
CREATE POLICY "Users can delete own profile" ON api.profiles
    FOR DELETE USING (auth.uid() = user_id);

-- 4. Grant DELETE permission on profiles to authenticated users
GRANT DELETE ON api.profiles TO authenticated;

-- 5. Check and enable RLS on other existing tables
-- Favorites table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'api' AND table_name = 'favorites') THEN
        ALTER TABLE api.favorites ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies
        DROP POLICY IF EXISTS "Users can delete own favorites" ON api.favorites;
        
        -- Create delete policy
        CREATE POLICY "Users can delete own favorites" ON api.favorites
            FOR DELETE USING (auth.uid() = user_id);
            
        -- Grant permission
        GRANT DELETE ON api.favorites TO authenticated;
    END IF;
END $$;

-- Friend requests table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'api' AND table_name = 'friend_requests') THEN
        ALTER TABLE api.friend_requests ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies
        DROP POLICY IF EXISTS "Users can delete own friend requests" ON api.friend_requests;
        
        -- Create delete policy
        CREATE POLICY "Users can delete own friend requests" ON api.friend_requests
            FOR DELETE USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
            
        -- Grant permission
        GRANT DELETE ON api.friend_requests TO authenticated;
    END IF;
END $$;

-- Friendships table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'api' AND table_name = 'friendships') THEN
        ALTER TABLE api.friendships ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies
        DROP POLICY IF EXISTS "Users can delete own friendships" ON api.friendships;
        
        -- Create delete policy
        CREATE POLICY "Users can delete own friendships" ON api.friendships
            FOR DELETE USING (auth.uid() = user_id1 OR auth.uid() = user_id2);
            
        -- Grant permission
        GRANT DELETE ON api.friendships TO authenticated;
    END IF;
END $$;

-- 6. Update the delete-user route tables list
-- You'll need to update src/app/api/delete-user/route.ts to only delete from existing tables:
-- const tables = ['profiles', 'favorites', 'friend_requests', 'friendships']

-- 7. IMPORTANT: Supabase Dashboard Settings
-- Go to Authentication > URL Configuration and add these URLs:
-- - https://obelisk.codes/auth/callback
-- - http://localhost:3000/auth/callback
-- - Any other domains you use