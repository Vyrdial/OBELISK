-- Fix Profile Creation Issues
-- This ensures profiles are created properly with sequential IDs even after deletions

-- 1. Create a more robust profile creation function
CREATE OR REPLACE FUNCTION api.create_profile_for_user(p_user_id UUID)
RETURNS api.profiles AS $$
DECLARE
    new_profile api.profiles;
    next_id INTEGER;
    random_suffix TEXT;
    adjective TEXT;
    noun TEXT;
    username_candidate TEXT;
    attempts INTEGER := 0;
BEGIN
    -- Arrays of cosmic words for username generation
    adjective := (ARRAY['Cosmic', 'Stellar', 'Nebula', 'Quantum', 'Astral', 'Lunar', 'Solar', 'Galactic', 'Ethereal', 'Mystic'])[floor(random() * 10 + 1)];
    noun := (ARRAY['Explorer', 'Wanderer', 'Seeker', 'Guardian', 'Observer', 'Dreamer', 'Voyager', 'Pioneer', 'Scholar', 'Sage'])[floor(random() * 10 + 1)];
    
    -- Find the next available profile_id
    SELECT COALESCE(MIN(t1.profile_id + 1), 1)
    INTO next_id
    FROM api.profiles t1
    LEFT JOIN api.profiles t2 ON t1.profile_id + 1 = t2.profile_id
    WHERE t2.profile_id IS NULL;
    
    -- Handle empty table case
    IF next_id IS NULL THEN
        next_id := 1;
    END IF;
    
    -- Generate a unique username
    LOOP
        random_suffix := lpad(floor(random() * 10000)::text, 4, '0');
        username_candidate := lower(adjective || '_' || noun || '_' || random_suffix);
        
        -- Check if username exists
        IF NOT EXISTS (SELECT 1 FROM api.profiles WHERE username = username_candidate) THEN
            EXIT;
        END IF;
        
        attempts := attempts + 1;
        IF attempts > 100 THEN
            -- Fallback to UUID-based username
            username_candidate := 'user_' || substring(p_user_id::text, 1, 8);
            EXIT;
        END IF;
    END LOOP;
    
    -- Insert the new profile
    INSERT INTO api.profiles (
        user_id,
        profile_id,
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
        p_user_id,
        next_id,
        username_candidate,
        adjective || ' ' || noun,
        0,
        100, -- Starting stardust
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
        -- If there's a race condition, try again with a different username
        RETURN api.create_profile_for_user(p_user_id);
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create profile: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 2. Create a trigger to automatically create profiles for new users
CREATE OR REPLACE FUNCTION api.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create a profile for the new user
    PERFORM api.create_profile_for_user(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Drop and recreate the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION api.handle_new_user();

-- 4. Grant necessary permissions
GRANT EXECUTE ON FUNCTION api.create_profile_for_user TO authenticated;
GRANT EXECUTE ON FUNCTION api.handle_new_user TO authenticated;

-- 5. Ensure the profile_id sequence is properly set
DO $$
BEGIN
    -- Reset sequence to max profile_id + 1
    PERFORM setval('api.profiles_profile_id_seq', COALESCE((SELECT MAX(profile_id) FROM api.profiles), 0) + 1, false);
END $$;

-- 6. Fix any users without profiles
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT u.id 
        FROM auth.users u
        LEFT JOIN api.profiles p ON u.id = p.user_id
        WHERE p.user_id IS NULL
    LOOP
        PERFORM api.create_profile_for_user(r.id);
    END LOOP;
END $$;

-- 7. Add a function to check and create profile if missing
CREATE OR REPLACE FUNCTION api.ensure_user_has_profile(p_user_id UUID)
RETURNS api.profiles AS $$
DECLARE
    existing_profile api.profiles;
BEGIN
    -- Check if profile exists
    SELECT * INTO existing_profile
    FROM api.profiles
    WHERE user_id = p_user_id;
    
    -- If not, create it
    IF existing_profile IS NULL THEN
        existing_profile := api.create_profile_for_user(p_user_id);
    END IF;
    
    RETURN existing_profile;
END;
$$ LANGUAGE plpgsql;

-- Grant permission
GRANT EXECUTE ON FUNCTION api.ensure_user_has_profile TO authenticated;