-- Quick Cosmetics Setup for OBELISK
-- Run this in Supabase SQL editor to add essential columns for cosmetics

-- Add columns to profiles table if they don't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS equipped_singularity text DEFAULT 'classic-singularity',
ADD COLUMN IF NOT EXISTS equipped_effects text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS equipped_title text,
ADD COLUMN IF NOT EXISTS unlocked_cosmetics text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS stardust integer DEFAULT 100,
ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false;

-- Give all existing users some default cosmetics
UPDATE profiles 
SET 
  unlocked_cosmetics = ARRAY['none', 'cosmic-aurora'],
  equipped_effects = ARRAY['cosmic-aurora'],
  stardust = COALESCE(stardust, 100)
WHERE unlocked_cosmetics IS NULL OR array_length(unlocked_cosmetics, 1) IS NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_equipped_effects ON profiles USING GIN(equipped_effects);