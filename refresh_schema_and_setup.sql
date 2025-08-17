-- Complete Schema Refresh and Setup for OBELISK Cosmetics
-- Run this entire script in Supabase SQL editor

-- Step 1: Drop and recreate columns to ensure clean state
ALTER TABLE profiles DROP COLUMN IF EXISTS equipped_singularity;
ALTER TABLE profiles DROP COLUMN IF EXISTS equipped_effects;
ALTER TABLE profiles DROP COLUMN IF EXISTS equipped_title;
ALTER TABLE profiles DROP COLUMN IF EXISTS unlocked_cosmetics;
ALTER TABLE profiles DROP COLUMN IF EXISTS stardust;
ALTER TABLE profiles DROP COLUMN IF EXISTS is_premium;

-- Step 2: Add columns back with proper types
ALTER TABLE profiles 
ADD COLUMN equipped_singularity text DEFAULT 'classic-singularity',
ADD COLUMN equipped_effects text[] DEFAULT ARRAY[]::text[],
ADD COLUMN equipped_title text,
ADD COLUMN unlocked_cosmetics text[] DEFAULT ARRAY[]::text[],
ADD COLUMN stardust integer DEFAULT 100,
ADD COLUMN is_premium boolean DEFAULT false;

-- Step 3: Update existing users with default values
UPDATE profiles 
SET 
  equipped_singularity = COALESCE(equipped_singularity, 'classic-singularity'),
  equipped_effects = COALESCE(equipped_effects, ARRAY['cosmic-aurora']::text[]),
  unlocked_cosmetics = COALESCE(unlocked_cosmetics, ARRAY['none', 'cosmic-aurora']::text[]),
  stardust = COALESCE(stardust, 100),
  is_premium = COALESCE(is_premium, false);

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_equipped_effects ON profiles USING GIN(equipped_effects);
CREATE INDEX IF NOT EXISTS idx_profiles_equipped_singularity ON profiles(equipped_singularity);
CREATE INDEX IF NOT EXISTS idx_profiles_unlocked_cosmetics ON profiles USING GIN(unlocked_cosmetics);

-- Step 5: Force schema cache refresh by reloading PostgREST configuration
NOTIFY pgrst, 'reload schema';

-- Step 6: Verify the setup
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('equipped_singularity', 'equipped_effects', 'equipped_title', 'unlocked_cosmetics', 'stardust', 'is_premium')
ORDER BY column_name;

-- Should show all 6 columns if successful