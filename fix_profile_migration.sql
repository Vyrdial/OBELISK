-- Fix migration: Handle existing views and add missing columns
-- This script properly drops existing views before recreating them

-- Step 1: Drop existing views if they exist
DROP VIEW IF EXISTS api.friend_requests_with_profiles CASCADE;
DROP VIEW IF EXISTS api.friend_requests CASCADE;

-- Step 2: Ensure required columns exist in api.profiles table
ALTER TABLE api.profiles 
ADD COLUMN IF NOT EXISTS equipped_singularity TEXT DEFAULT 'classic-singularity';

ALTER TABLE api.profiles 
ADD COLUMN IF NOT EXISTS equipped_aura TEXT DEFAULT 'none';

-- Step 3: Add the profile_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'api' 
                   AND table_name = 'profiles' 
                   AND column_name = 'profile_id') THEN
        ALTER TABLE api.profiles ADD COLUMN profile_id SERIAL;
    END IF;
END $$;

-- Step 4: Add constraints if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_schema = 'api' 
                   AND table_name = 'profiles' 
                   AND constraint_name = 'profiles_profile_id_unique') THEN
        ALTER TABLE api.profiles ADD CONSTRAINT profiles_profile_id_unique UNIQUE (profile_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_schema = 'api' 
                   AND table_name = 'profiles' 
                   AND constraint_name = 'profiles_profile_id_positive') THEN
        ALTER TABLE api.profiles ADD CONSTRAINT profiles_profile_id_positive CHECK (profile_id > 0);
    END IF;
END $$;

-- Step 5: Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_profiles_profile_id ON api.profiles(profile_id);

-- Step 6: Create or replace the profile lookup functions
CREATE OR REPLACE FUNCTION api.get_profile_by_id(p_profile_id INTEGER)
RETURNS TABLE (
    profile_id INTEGER,
    user_id UUID,
    username TEXT,
    display_name TEXT,
    equipped_singularity TEXT,
    equipped_aura TEXT,
    stardust INTEGER,
    xp INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.profile_id,
        p.user_id,
        p.username,
        p.display_name,
        p.equipped_singularity,
        p.equipped_aura,
        p.stardust,
        p.xp,
        p.created_at,
        p.updated_at
    FROM api.profiles p
    WHERE p.profile_id = p_profile_id;
END;
$$;

CREATE OR REPLACE FUNCTION api.get_profile_id_from_user_id(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_profile_id INTEGER;
BEGIN
    SELECT profile_id INTO v_profile_id
    FROM api.profiles
    WHERE user_id = p_user_id;
    
    RETURN v_profile_id;
END;
$$;

-- Step 7: Recreate friend_requests view with correct structure
CREATE VIEW api.friend_requests AS
SELECT 
    fr.id,
    fr.requester_id,
    fr.addressee_id,
    fr.status,
    fr.created_at,
    fr.updated_at,
    -- Requester profile info
    rp.profile_id AS requester_profile_id,
    rp.username AS requester_username,
    rp.display_name AS requester_name,
    rp.equipped_singularity AS requester_equipped_singularity,
    -- Addressee profile info
    ap.profile_id AS addressee_profile_id,
    ap.username AS addressee_username,
    ap.display_name AS addressee_name,
    ap.equipped_singularity AS addressee_equipped_singularity
FROM api.friendships fr
JOIN api.profiles rp ON fr.requester_id = rp.user_id
JOIN api.profiles ap ON fr.addressee_id = ap.user_id;

-- Step 8: Create enhanced view
CREATE VIEW api.friend_requests_with_profiles AS
SELECT * FROM api.friend_requests;

-- Step 9: Grant necessary permissions
GRANT SELECT ON api.friend_requests TO authenticated;
GRANT SELECT ON api.friend_requests_with_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION api.get_profile_by_id TO authenticated;
GRANT EXECUTE ON FUNCTION api.get_profile_id_from_user_id TO authenticated;

-- Step 10: Add comments for documentation
COMMENT ON COLUMN api.profiles.profile_id IS 'Auto-incrementing integer ID for clean profile URLs';
COMMENT ON COLUMN api.profiles.equipped_aura IS 'Currently equipped aura cosmetic effect';
COMMENT ON FUNCTION api.get_profile_by_id IS 'Retrieve profile data using integer profile_id';
COMMENT ON FUNCTION api.get_profile_id_from_user_id IS 'Convert UUID user_id to integer profile_id';

-- Step 11: Verify the setup
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM information_schema.columns 
WHERE table_schema = 'api' 
    AND table_name = 'profiles' 
    AND column_name IN ('profile_id', 'equipped_aura', 'equipped_singularity')
ORDER BY column_name;