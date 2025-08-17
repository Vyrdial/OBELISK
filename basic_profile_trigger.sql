-- Basic Profile Creation Trigger
-- This ensures profiles are created for new users without any complex logic

-- 1. Simple trigger function
CREATE OR REPLACE FUNCTION api.create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert a basic profile
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
        is_premium
    ) VALUES (
        NEW.id,
        'user_' || substring(NEW.id::text, 1, 8),
        'Cosmic Explorer',
        0,
        100,
        'Sand',
        ARRAY['classic-singularity']::text[],
        ARRAY['First Steps']::text[],
        'classic-singularity',
        false
    ) ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Don't fail user creation if profile creation fails
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;
CREATE TRIGGER create_profile_on_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION api.create_profile_for_new_user();

-- 3. Fix any existing users without profiles
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
    is_premium
)
SELECT 
    id,
    'user_' || substring(id::text, 1, 8),
    'Cosmic Explorer',
    0,
    100,
    'Sand',
    ARRAY['classic-singularity']::text[],
    ARRAY['First Steps']::text[],
    'classic-singularity',
    false
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM api.profiles WHERE user_id = auth.users.id
);