-- SQL function to safely add stardust to a user's account
-- This should be run in your Supabase SQL editor

CREATE OR REPLACE FUNCTION add_stardust(user_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles 
  SET stardust = COALESCE(stardust, 0) + amount,
      updated_at = NOW()
  WHERE id = user_id;
  
  -- If no rows were updated, the user doesn't exist
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User with ID % not found', user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;