-- Add equipped_hat column to api.profiles table for premium users
-- Run this in your Supabase SQL Editor

-- Add the equipped_hat column if it doesn't exist
ALTER TABLE api.profiles 
ADD COLUMN IF NOT EXISTS equipped_hat TEXT DEFAULT NULL;

-- Remove the old crown column if it exists
ALTER TABLE api.profiles 
DROP COLUMN IF EXISTS equipped_crown;

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_schema = 'api' 
AND table_name = 'profiles' 
AND column_name = 'equipped_hat';

SELECT 'Hat column added successfully!' as status;