-- Grant premium crown to all premium users
-- Run this in your Supabase SQL Editor

-- Update all premium users to have the premium crown equipped
UPDATE api.profiles 
SET equipped_crown = 'premium-crown'
WHERE is_premium = true 
AND equipped_crown IS NULL;

-- Also add premium-crown to their unlocked cosmetics if not already there
UPDATE api.profiles 
SET unlocked_cosmetics = 
  CASE 
    WHEN 'premium-crown' = ANY(unlocked_cosmetics) THEN unlocked_cosmetics
    ELSE array_append(unlocked_cosmetics, 'premium-crown')
  END
WHERE is_premium = true;

-- Check results
SELECT username, is_premium, equipped_crown, unlocked_cosmetics
FROM api.profiles
WHERE is_premium = true;

SELECT 'Premium crowns granted!' as status;