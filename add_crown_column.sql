-- Add equipped_crown column to api.profiles table for premium users
-- Run this in your Supabase SQL Editor

-- Add the equipped_crown column if it doesn't exist
ALTER TABLE api.profiles 
ADD COLUMN IF NOT EXISTS equipped_crown TEXT DEFAULT NULL;

-- Available crown styles (for reference)
-- 'golden-crown' - Classic golden crown for premium users
-- 'diamond-crown' - Crystalline crown (future premium tier)
-- 'cosmic-crown' - Nebula-infused crown (special events)

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_schema = 'api' 
AND table_name = 'profiles' 
AND column_name = 'equipped_crown';

SELECT 'Crown column added successfully!' as status;