-- ONE-TIME SETUP: Automatic Profile ID Management
-- Run this ONCE to set up automatic profile ID management that handles deletions

-- 1. Create a function that automatically assigns the next available profile_id
CREATE OR REPLACE FUNCTION api.get_next_profile_id()
RETURNS INTEGER AS $$
DECLARE
    next_id INTEGER;
BEGIN
    -- Find the lowest available profile_id (fills gaps from deletions)
    SELECT COALESCE(MIN(t1.profile_id + 1), 1)
    INTO next_id
    FROM api.profiles t1
    LEFT JOIN api.profiles t2 ON t1.profile_id + 1 = t2.profile_id
    WHERE t2.profile_id IS NULL;
    
    -- Handle empty table
    IF NOT EXISTS (SELECT 1 FROM api.profiles) THEN
        next_id := 1;
    END IF;
    
    RETURN next_id;
END;
$$ LANGUAGE plpgsql;

-- 2. Create an RPC function to create profiles with automatic ID assignment
CREATE OR REPLACE FUNCTION api.create_profile_with_auto_id(
    p_user_id UUID,
    p_username TEXT,
    p_display_name TEXT,
    p_cosmic_title TEXT
)
RETURNS api.profiles AS $$
DECLARE
    new_profile api.profiles;
    next_id INTEGER;
BEGIN
    -- Get the next available profile_id
    next_id := api.get_next_profile_id();
    
    -- Insert the new profile
    INSERT INTO api.profiles (
        user_id,
        profile_id,
        username,
        display_name,
        cosmic_title,
        xp,
        stardust,
        evolution_stage,
        unlocked_cosmetics,
        achievements,
        equipped_singularity,
        equipped_effects,
        is_premium
    ) VALUES (
        p_user_id,
        next_id,
        p_username,
        p_display_name,
        p_cosmic_title,
        0,
        100,
        'Sand',
        ARRAY['classic-singularity']::text[],
        ARRAY['First Steps']::text[],
        'classic-singularity',
        ARRAY[]::text[],
        false
    )
    RETURNING * INTO new_profile;
    
    RETURN new_profile;
EXCEPTION
    WHEN unique_violation THEN
        -- If someone else grabbed the same ID, try again
        RETURN api.create_profile_with_auto_id(p_user_id, p_username, p_display_name, p_cosmic_title);
END;
$$ LANGUAGE plpgsql;

-- 3. Grant permissions
GRANT EXECUTE ON FUNCTION api.get_next_profile_id TO authenticated;
GRANT EXECUTE ON FUNCTION api.create_profile_with_auto_id TO authenticated;

-- That's it! The system will now automatically handle profile ID gaps