-- Fix profile creation RPC function to work with current database schema
-- Run this in Supabase SQL editor to fix the profile creation issue

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS api.create_profile_with_auto_id(UUID, TEXT, TEXT, TEXT);

-- Create the corrected RPC function without equipped_effects column
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
    
    -- Insert the new profile (without equipped_effects column)
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION api.create_profile_with_auto_id TO authenticated;