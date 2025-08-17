-- Complete Profile System Fix
-- This handles profile creation whether profile_id column exists or not

-- 1. First check if profile_id column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'api' 
        AND table_name = 'profiles' 
        AND column_name = 'profile_id'
    ) THEN
        ALTER TABLE api.profiles ADD COLUMN profile_id SERIAL UNIQUE;
        CREATE INDEX idx_profiles_profile_id ON api.profiles(profile_id);
    END IF;
END $$;

-- 2. Create a function to get next available profile_id
CREATE OR REPLACE FUNCTION api.get_next_profile_id()
RETURNS INTEGER AS $$
DECLARE
    next_id INTEGER;
BEGIN
    -- Check if profile_id column exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'api' 
        AND table_name = 'profiles' 
        AND column_name = 'profile_id'
    ) THEN
        -- Find the lowest available profile_id
        SELECT COALESCE(MIN(t1.profile_id + 1), 1)
        INTO next_id
        FROM api.profiles t1
        LEFT JOIN api.profiles t2 ON t1.profile_id + 1 = t2.profile_id
        WHERE t2.profile_id IS NULL;
        
        IF next_id IS NULL THEN
            next_id := 1;
        END IF;
    ELSE
        next_id := NULL;
    END IF;
    
    RETURN next_id;
END;
$$ LANGUAGE plpgsql;

-- 3. Create trigger function that works with or without profile_id
CREATE OR REPLACE FUNCTION api.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    random_suffix TEXT;
    adjective TEXT;
    noun TEXT;
    username_candidate TEXT;
    display_name_value TEXT;
    next_profile_id INTEGER;
BEGIN
    -- Generate username components
    adjective := (ARRAY['Cosmic', 'Stellar', 'Nebula', 'Quantum', 'Astral', 'Lunar', 'Solar', 'Galactic', 'Ethereal', 'Mystic'])[floor(random() * 10 + 1)];
    noun := (ARRAY['Explorer', 'Wanderer', 'Seeker', 'Guardian', 'Observer', 'Dreamer', 'Voyager', 'Pioneer', 'Scholar', 'Sage'])[floor(random() * 10 + 1)];
    random_suffix := lpad(floor(random() * 10000)::text, 4, '0');
    username_candidate := lower(adjective || '_' || noun || '_' || random_suffix);
    display_name_value := adjective || ' ' || noun;
    
    -- Get next profile ID if column exists
    next_profile_id := api.get_next_profile_id();
    
    -- Insert profile
    IF next_profile_id IS NOT NULL THEN
        -- profile_id column exists
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
            is_premium
        ) VALUES (
            NEW.id,
            next_profile_id,
            username_candidate,
            display_name_value,
            0,
            100,
            'Sand',
            ARRAY['classic-singularity']::text[],
            ARRAY['First Steps']::text[],
            'classic-singularity',
            false
        ) ON CONFLICT (user_id) DO NOTHING;
    ELSE
        -- profile_id column doesn't exist
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
            username_candidate,
            display_name_value,
            0,
            100,
            'Sand',
            ARRAY['classic-singularity']::text[],
            ARRAY['First Steps']::text[],
            'classic-singularity',
            false
        ) ON CONFLICT (user_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the user creation
        RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION api.handle_new_user();

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION api.handle_new_user TO service_role;
GRANT EXECUTE ON FUNCTION api.get_next_profile_id TO authenticated, service_role;

-- 6. Create a manual profile creation function that can be called from the app
CREATE OR REPLACE FUNCTION api.ensure_profile_exists(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    profile_exists BOOLEAN;
    random_suffix TEXT;
    adjective TEXT;
    noun TEXT;
    username_candidate TEXT;
    display_name_value TEXT;
    next_profile_id INTEGER;
BEGIN
    -- Check if profile already exists
    SELECT EXISTS(SELECT 1 FROM api.profiles WHERE user_id = p_user_id) INTO profile_exists;
    
    IF profile_exists THEN
        RETURN TRUE;
    END IF;
    
    -- Generate profile data
    adjective := (ARRAY['Cosmic', 'Stellar', 'Nebula', 'Quantum', 'Astral', 'Lunar', 'Solar', 'Galactic', 'Ethereal', 'Mystic'])[floor(random() * 10 + 1)];
    noun := (ARRAY['Explorer', 'Wanderer', 'Seeker', 'Guardian', 'Observer', 'Dreamer', 'Voyager', 'Pioneer', 'Scholar', 'Sage'])[floor(random() * 10 + 1)];
    random_suffix := lpad(floor(random() * 10000)::text, 4, '0');
    username_candidate := lower(adjective || '_' || noun || '_' || random_suffix);
    display_name_value := adjective || ' ' || noun;
    
    -- Get next profile ID if column exists
    next_profile_id := api.get_next_profile_id();
    
    -- Create profile
    IF next_profile_id IS NOT NULL THEN
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
            is_premium
        ) VALUES (
            p_user_id,
            next_profile_id,
            username_candidate,
            display_name_value,
            0,
            100,
            'Sand',
            ARRAY['classic-singularity']::text[],
            ARRAY['First Steps']::text[],
            'classic-singularity',
            false
        );
    ELSE
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
            p_user_id,
            username_candidate,
            display_name_value,
            0,
            100,
            'Sand',
            ARRAY['classic-singularity']::text[],
            ARRAY['First Steps']::text[],
            'classic-singularity',
            false
        );
    END IF;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant permission
GRANT EXECUTE ON FUNCTION api.ensure_profile_exists TO authenticated;

-- 8. Fix any existing users without profiles
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
        PERFORM api.ensure_profile_exists(r.id);
    END LOOP;
END $$;