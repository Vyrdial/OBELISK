-- Fix Profile ID Gaps and Session Issues
-- This fixes the issue where deleted accounts create gaps in profile IDs
-- and ensures proper profile creation with sequential IDs

-- 1. First, let's create a function to reassign profile IDs sequentially
CREATE OR REPLACE FUNCTION api.reassign_profile_ids()
RETURNS void AS $$
DECLARE
    r RECORD;
    new_id INTEGER := 1;
BEGIN
    -- Reassign profile_ids sequentially
    FOR r IN 
        SELECT user_id 
        FROM api.profiles 
        ORDER BY created_at, user_id
    LOOP
        UPDATE api.profiles 
        SET profile_id = new_id 
        WHERE user_id = r.user_id;
        
        new_id := new_id + 1;
    END LOOP;
    
    -- Reset the sequence to continue from the highest ID
    PERFORM setval('api.profiles_profile_id_seq', COALESCE((SELECT MAX(profile_id) FROM api.profiles), 0) + 1, false);
END;
$$ LANGUAGE plpgsql;

-- 2. Run the reassignment (comment out if you don't want to reassign existing IDs)
-- SELECT api.reassign_profile_ids();

-- 3. Create a trigger to handle profile_id assignment on insert
-- This ensures new profiles get the next available ID without gaps
CREATE OR REPLACE FUNCTION api.assign_next_profile_id()
RETURNS TRIGGER AS $$
DECLARE
    next_id INTEGER;
BEGIN
    -- Find the next available profile_id (filling gaps)
    SELECT COALESCE(MIN(t1.profile_id + 1), 1)
    INTO next_id
    FROM api.profiles t1
    LEFT JOIN api.profiles t2 ON t1.profile_id + 1 = t2.profile_id
    WHERE t2.profile_id IS NULL;
    
    -- Assign the next available ID
    NEW.profile_id := next_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Drop existing trigger if it exists
DROP TRIGGER IF EXISTS assign_profile_id_trigger ON api.profiles;

-- 5. Create the trigger
CREATE TRIGGER assign_profile_id_trigger
BEFORE INSERT ON api.profiles
FOR EACH ROW
WHEN (NEW.profile_id IS NULL)
EXECUTE FUNCTION api.assign_next_profile_id();

-- 6. Fix the get_profile_by_id function to handle missing profiles gracefully
CREATE OR REPLACE FUNCTION api.get_profile_by_id(p_profile_id INTEGER)
RETURNS TABLE (
    user_id UUID,
    profile_id INTEGER,
    username TEXT,
    display_name TEXT,
    xp INTEGER,
    stardust INTEGER,
    evolution_stage TEXT,
    unlocked_cosmetics TEXT[],
    achievements TEXT[],
    equipped_singularity TEXT,
    equipped_hat TEXT,
    equipped_face TEXT,
    equipped_aura TEXT,
    equipped_effects TEXT[],
    is_premium BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.user_id,
        p.profile_id,
        p.username,
        p.display_name,
        p.xp,
        p.stardust,
        p.evolution_stage,
        p.unlocked_cosmetics,
        p.achievements,
        p.equipped_singularity,
        p.equipped_hat,
        p.equipped_face,
        p.equipped_aura,
        p.equipped_effects,
        p.is_premium,
        p.created_at,
        p.updated_at
    FROM api.profiles p
    WHERE p.profile_id = p_profile_id
    LIMIT 1; -- Ensure only one result
END;
$$ LANGUAGE plpgsql STABLE;

-- 7. Create a function to check if a profile exists
CREATE OR REPLACE FUNCTION api.profile_exists(p_profile_id INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM api.profiles WHERE profile_id = p_profile_id);
END;
$$ LANGUAGE plpgsql STABLE;

-- 8. Grant permissions
GRANT EXECUTE ON FUNCTION api.profile_exists TO authenticated;
GRANT EXECUTE ON FUNCTION api.assign_next_profile_id TO authenticated;

-- 9. Update RLS policies to ensure users can only access valid profiles
DROP POLICY IF EXISTS "Users can view any profile by ID" ON api.profiles;
CREATE POLICY "Users can view any profile by ID" ON api.profiles
    FOR SELECT USING (true); -- Allow viewing any profile that exists

-- 10. Create an index for faster profile lookups
DROP INDEX IF EXISTS idx_profiles_profile_id;
CREATE UNIQUE INDEX idx_profiles_profile_id ON api.profiles(profile_id);

-- Optional: View current profile ID assignments
-- SELECT user_id, profile_id, username, created_at FROM api.profiles ORDER BY profile_id;

-- Optional: Check for gaps in profile IDs
-- SELECT 
--     profile_id + 1 as gap_start,
--     next_profile_id - 1 as gap_end
-- FROM (
--     SELECT profile_id, LEAD(profile_id) OVER (ORDER BY profile_id) as next_profile_id
--     FROM api.profiles
-- ) t
-- WHERE next_profile_id - profile_id > 1;