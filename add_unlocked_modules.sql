-- Add unlocked_modules column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS unlocked_modules text[] DEFAULT ARRAY[]::text[];

-- Add comment
COMMENT ON COLUMN profiles.unlocked_modules IS 'Array of module IDs that the user has unlocked in lessons';

-- Create a function to add unlocked modules
CREATE OR REPLACE FUNCTION add_unlocked_module(
  p_user_id uuid,
  p_module_id text
)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET unlocked_modules = array_append(
    COALESCE(unlocked_modules, ARRAY[]::text[]), 
    p_module_id
  )
  WHERE user_id = p_user_id
  AND NOT (p_module_id = ANY(COALESCE(unlocked_modules, ARRAY[]::text[])));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION add_unlocked_module TO authenticated;