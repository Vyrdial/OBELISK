-- Simple Profile Creation Fix
-- This ensures profiles are created automatically for new users

-- 1. Create a simple trigger function to auto-create profiles
CREATE OR REPLACE FUNCTION api.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    random_suffix TEXT;
    adjective TEXT;
    noun TEXT;
    username_candidate TEXT;
    display_name_value TEXT;
BEGIN
    -- Arrays of cosmic words for username generation
    adjective := (ARRAY['Cosmic', 'Stellar', 'Nebula', 'Quantum', 'Astral', 'Lunar', 'Solar', 'Galactic', 'Ethereal', 'Mystic'])[floor(random() * 10 + 1)];
    noun := (ARRAY['Explorer', 'Wanderer', 'Seeker', 'Guardian', 'Observer', 'Dreamer', 'Voyager', 'Pioneer', 'Scholar', 'Sage'])[floor(random() * 10 + 1)];
    
    -- Generate username
    random_suffix := lpad(floor(random() * 10000)::text, 4, '0');
    username_candidate := lower(adjective || '_' || noun || '_' || random_suffix);
    display_name_value := adjective || ' ' || noun;
    
    -- Insert profile
    INSERT INTO api.profiles (
        user_id,
        username,
        display_name,
        xp,
        stardust,
        evolution_stage,
        unlocked_cosmetics,
        achievements,
        equipped_singularity,
        equipped_effects,
        is_premium
    ) VALUES (
        NEW.id,
        username_candidate,
        display_name_value,
        0,
        100,
        'Sand',
        ARRAY['classic-singularity']::text[],
        ARRAY['First Steps']::text[],
        'classic-singularity',
        ARRAY[]::text[],
        false
    ) ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION api.handle_new_user();

-- 4. Grant execute permission
GRANT EXECUTE ON FUNCTION api.handle_new_user TO service_role;

-- 5. Fix any existing users without profiles
INSERT INTO api.profiles (
    user_id,
    username,
    display_name,
    xp,
    stardust,
    evolution_stage,
    unlocked_cosmetics,
    achievements,
    equipped_singularity,
    equipped_effects,
    is_premium
)
SELECT 
    u.id,
    'user_' || substring(u.id::text, 1, 8),
    'Cosmic Explorer',
    0,
    100,
    'Sand',
    ARRAY['classic-singularity']::text[],
    ARRAY['First Steps']::text[],
    'classic-singularity',
    ARRAY[]::text[],
    false
FROM auth.users u
LEFT JOIN api.profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL;