-- Add is_premium column to api.profiles table
-- Run this in your Supabase SQL Editor

-- Add the is_premium column if it doesn't exist
ALTER TABLE api.profiles 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_schema = 'api' 
AND table_name = 'profiles' 
AND column_name = 'is_premium';

SELECT 'Premium column added successfully!' as status;