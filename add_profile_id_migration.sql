-- Migration: Add auto-incrementing profile_id to profiles table
-- Purpose: Enable clean integer-based profile URLs while maintaining Supabase auth compatibility

-- Step 1: Ensure required columns exist in api.profiles table
ALTER TABLE api.profiles 
ADD COLUMN IF NOT EXISTS equipped_singularity TEXT DEFAULT 'classic-singularity';

ALTER TABLE api.profiles 
ADD COLUMN IF NOT EXISTS equipped_aura TEXT DEFAULT 'none';

-- Step 2: Add the profile_id column as SERIAL
ALTER TABLE api.profiles 
ADD COLUMN profile_id SERIAL;

-- Step 3: Make the column NOT NULL and UNIQUE
-- (SERIAL already implies NOT NULL, but we'll add UNIQUE)
ALTER TABLE api.profiles
ADD CONSTRAINT profiles_profile_id_unique UNIQUE (profile_id);

-- Step 4: Create an index for fast lookups
CREATE INDEX idx_profiles_profile_id ON api.profiles(profile_id);

-- Step 5: Ensure all existing records have sequential profile_ids
-- (SERIAL will handle this automatically for existing rows)

-- Step 6: Add a check constraint to ensure profile_id is always positive
ALTER TABLE api.profiles
ADD CONSTRAINT profiles_profile_id_positive CHECK (profile_id > 0);

-- Step 7: Create a function to get profile by profile_id
CREATE OR REPLACE FUNCTION api.get_profile_by_id(p_profile_id INTEGER)
RETURNS TABLE (
    profile_id INTEGER,
    user_id UUID,
    username TEXT,
    display_name TEXT,
    equipped_singularity TEXT,
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
        p.stardust,
        p.xp,
        p.created_at,
        p.updated_at
    FROM api.profiles p
    WHERE p.profile_id = p_profile_id;
END;
$$;

-- Step 8: Create friend_requests view (for compatibility with useFriends hook)
CREATE OR REPLACE VIEW api.friend_requests AS
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

-- Step 9: Create friend_requests_with_profiles view (enhanced version)
CREATE OR REPLACE VIEW api.friend_requests_with_profiles AS
SELECT * FROM api.friend_requests;

-- Grant necessary permissions
GRANT SELECT ON api.friend_requests TO authenticated;
GRANT SELECT ON api.friend_requests_with_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION api.get_profile_by_id TO authenticated;

-- Add RLS policy for the new function
ALTER FUNCTION api.get_profile_by_id OWNER TO postgres;

-- Create a helper function to get profile_id from user_id
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

GRANT EXECUTE ON FUNCTION api.get_profile_id_from_user_id TO authenticated;

-- Add comment for documentation
COMMENT ON COLUMN api.profiles.profile_id IS 'Auto-incrementing integer ID for clean profile URLs';
COMMENT ON FUNCTION api.get_profile_by_id IS 'Retrieve profile data using integer profile_id';
COMMENT ON FUNCTION api.get_profile_id_from_user_id IS 'Convert UUID user_id to integer profile_id';

-- Verification queries (commented out - run manually to verify)
-- SELECT profile_id, user_id, username, equipped_singularity FROM api.profiles ORDER BY profile_id LIMIT 10;
-- SELECT id, requester_profile_id, addressee_profile_id, status, requester_equipped_singularity, addressee_equipped_singularity FROM api.friend_requests LIMIT 5;