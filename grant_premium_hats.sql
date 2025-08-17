-- Grant premium hat to all premium users
-- Run this in your Supabase SQL Editor

-- Update all premium users to have the premium hat equipped
UPDATE api.profiles 
SET equipped_hat = 'premium-hat'
WHERE is_premium = true 
AND equipped_hat IS NULL;

-- Also add premium-hat to their unlocked cosmetics if not already there
UPDATE api.profiles 
SET unlocked_cosmetics = 
  CASE 
    WHEN 'premium-hat' = ANY(unlocked_cosmetics) THEN unlocked_cosmetics
    ELSE array_append(unlocked_cosmetics, 'premium-hat')
  END
WHERE is_premium = true;

-- Check results
SELECT username, is_premium, equipped_hat, unlocked_cosmetics
FROM api.profiles
WHERE is_premium = true;

SELECT 'Premium hats granted!' as status;