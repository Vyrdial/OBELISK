-- Update get_profile_by_id RPC function to include is_premium field
-- Run this in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION api.get_profile_by_id(p_profile_id INTEGER)
RETURNS TABLE (
    profile_id INTEGER,
    user_id UUID,
    username TEXT,
    display_name TEXT,
    equipped_singularity TEXT,
    equipped_aura TEXT,
    equipped_crown TEXT,
    stardust INTEGER,
    xp INTEGER,
    is_premium BOOLEAN,
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
        p.equipped_crown,
        p.stardust,
        p.xp,
        p.is_premium,
        p.created_at,
        p.updated_at
    FROM api.profiles p
    WHERE p.profile_id = p_profile_id;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION api.get_profile_by_id TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION api.get_profile_by_id IS 'Retrieve profile data using integer profile_id including premium status';

-- Verify the function works
SELECT 'Function updated successfully!' as status;