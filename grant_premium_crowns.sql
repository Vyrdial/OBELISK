-- Grant golden crown to all premium users
-- Run this in your Supabase SQL Editor

-- Update all premium users to have the golden crown equipped
UPDATE api.profiles 
SET equipped_crown = 'golden-crown'
WHERE is_premium = true 
AND equipped_crown IS NULL;

-- Also add golden-crown to their unlocked cosmetics if not already there
UPDATE api.profiles 
SET unlocked_cosmetics = 
  CASE 
    WHEN 'golden-crown' = ANY(unlocked_cosmetics) THEN unlocked_cosmetics
    ELSE array_append(unlocked_cosmetics, 'golden-crown')
  END
WHERE is_premium = true;

-- Check results
SELECT username, is_premium, equipped_crown, unlocked_cosmetics
FROM api.profiles
WHERE is_premium = true;

SELECT 'Premium crowns granted!' as status;