-- RPC Functions to bypass PostgREST schema cache issues
-- Run this in Supabase SQL editor

-- Function to update equipped singularity
CREATE OR REPLACE FUNCTION update_equipped_singularity(
  user_id_param UUID,
  singularity_id TEXT
)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET equipped_singularity = singularity_id 
  WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update equipped effects
CREATE OR REPLACE FUNCTION update_equipped_effects(
  user_id_param UUID,
  effect_id TEXT,
  effects_array TEXT[]
)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET equipped_effects = effects_array
  WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update equipped title
CREATE OR REPLACE FUNCTION update_equipped_title(
  user_id_param UUID,
  title_id TEXT
)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET equipped_title = title_id 
  WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION update_equipped_singularity(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_equipped_effects(UUID, TEXT, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION update_equipped_title(UUID, TEXT) TO authenticated;

-- Alternative: Direct SQL approach without schema cache
-- This creates a simpler workaround function that updates any column
CREATE OR REPLACE FUNCTION update_profile_cosmetic(
  user_id_param UUID,
  column_name TEXT,
  column_value TEXT
)
RETURNS void AS $$
BEGIN
  -- Validate column name to prevent SQL injection
  IF column_name NOT IN ('equipped_singularity', 'equipped_title') THEN
    RAISE EXCEPTION 'Invalid column name';
  END IF;
  
  -- Use dynamic SQL safely
  EXECUTE format('UPDATE profiles SET %I = $1 WHERE user_id = $2', column_name)
  USING column_value, user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- For array columns
CREATE OR REPLACE FUNCTION update_profile_cosmetic_array(
  user_id_param UUID,
  column_name TEXT,
  array_value TEXT[]
)
RETURNS void AS $$
BEGIN
  -- Validate column name to prevent SQL injection
  IF column_name NOT IN ('equipped_effects', 'unlocked_cosmetics') THEN
    RAISE EXCEPTION 'Invalid column name';
  END IF;
  
  -- Use dynamic SQL safely
  EXECUTE format('UPDATE profiles SET %I = $1 WHERE user_id = $2', column_name)
  USING array_value, user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION update_profile_cosmetic(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_profile_cosmetic_array(UUID, TEXT, TEXT[]) TO authenticated;