-- Add equipped_singularity column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS equipped_singularity TEXT DEFAULT 'classic-singularity';

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name = 'equipped_singularity';

-- Update any NULL values to default
UPDATE profiles
SET equipped_singularity = 'classic-singularity'
WHERE equipped_singularity IS NULL;

-- Test by setting a value
UPDATE profiles
SET equipped_singularity = 'cosmic-glow'
WHERE user_id = 'fbdb45bc-101f-4df8-827d-92e2117b3b74';

-- Verify it worked
SELECT user_id, username, equipped_singularity
FROM profiles
WHERE user_id = 'fbdb45bc-101f-4df8-827d-92e2117b3b74';