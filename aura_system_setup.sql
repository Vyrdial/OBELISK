-- OBELISK Aura System & Epic Styles Database Setup
-- Run this SQL in your Supabase SQL editor to set up the enhanced cosmetics system

-- ==========================================
-- 1. PROFILES TABLE ENHANCEMENTS
-- ==========================================

-- Ensure the profiles table has all necessary columns for the cosmetics system
-- Add columns if they don't already exist

DO $$
BEGIN
    -- Add equipped_singularity column (for avatar dot style)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'equipped_singularity') THEN
        ALTER TABLE profiles ADD COLUMN equipped_singularity text DEFAULT 'classic-singularity';
    END IF;

    -- Add equipped_effects column (for auras and other effects)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'equipped_effects') THEN
        ALTER TABLE profiles ADD COLUMN equipped_effects text[] DEFAULT ARRAY[]::text[];
    END IF;

    -- Add equipped_title column (for titles)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'equipped_title') THEN
        ALTER TABLE profiles ADD COLUMN equipped_title text;
    END IF;

    -- Add unlocked_cosmetics column (for purchased items)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'unlocked_cosmetics') THEN
        ALTER TABLE profiles ADD COLUMN unlocked_cosmetics text[] DEFAULT ARRAY[]::text[];
    END IF;

    -- Add stardust column (for purchasing cosmetics)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'stardust') THEN
        ALTER TABLE profiles ADD COLUMN stardust integer DEFAULT 100;
    END IF;

    -- Add premium status column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'is_premium') THEN
        ALTER TABLE profiles ADD COLUMN is_premium boolean DEFAULT false;
    END IF;

    RAISE NOTICE 'Profiles table columns verified/added successfully';
END
$$;

-- ==========================================
-- 2. COSMETICS TABLE (Optional - for advanced management)
-- ==========================================

-- Create a cosmetics catalog table (optional, but useful for managing items)
CREATE TABLE IF NOT EXISTS cosmetics_catalog (
    id text PRIMARY KEY,
    name text NOT NULL,
    description text NOT NULL,
    category text NOT NULL CHECK (category IN ('singularity', 'auras', 'effects', 'titles', 'treasures')),
    rarity text NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    price integer NOT NULL DEFAULT 0,
    premium_only boolean DEFAULT false,
    unlock_condition text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ==========================================
-- 3. INSERT DEFAULT COSMETICS DATA
-- ==========================================

-- Insert all the new epic singularity styles
INSERT INTO cosmetics_catalog (id, name, description, category, rarity, price, premium_only, unlock_condition) VALUES
-- Epic New Singularity Styles
('quantum-nexus', 'Quantum Nexus', 'Reality fractures around this impossible geometry. Exists in multiple dimensions simultaneously.', 'singularity', 'legendary', 750, true, 'Premium membership required'),
('temporal-vortex', 'Temporal Vortex', 'Time spirals endlessly around this chronomorphic singularity. Past and future converge.', 'singularity', 'legendary', 950, true, 'Premium membership required'),
('cosmic-forge', 'Cosmic Forge', 'Where stars are born and galaxies are shaped. The fundamental force of creation itself.', 'singularity', 'legendary', 850, true, 'Premium membership required'),
('shadow-monarch', 'Shadow Monarch', 'Absolute darkness given form. Light bends away, reality kneels before the void sovereign.', 'singularity', 'legendary', 1200, true, 'Premium membership required'),
('prism-matrix', 'Prism Matrix', 'Pure light fractalized into infinite geometries. Every photon tells a different story.', 'singularity', 'epic', 680, true, 'Premium membership required'),
('nebula-heart', 'Nebula Heart', 'The beating core of a stellar nursery. Where cosmic dust dances into new worlds.', 'singularity', 'epic', 420, true, 'Premium membership required'),

-- All Aura System Items
('none', 'No Aura', 'Clean and minimal appearance with no aura effects.', 'auras', 'common', 0, false, null),
('cosmic-aurora', 'Cosmic Aurora', 'Classic orange cosmic glow that pulses with universal energy.', 'auras', 'common', 50, false, null),
('stellar-blue', 'Stellar Blue', 'Deep blue stellar energy that resonates with distant stars.', 'auras', 'rare', 150, false, null),
('mystic-purple', 'Mystic Purple', 'Mysterious purple void energy from the cosmic depths.', 'auras', 'epic', 300, false, null),
('emerald-life', 'Emerald Life', 'Vibrant green life force that pulses with natural energy.', 'auras', 'rare', 200, false, null),
('crimson-flame', 'Crimson Flame', 'Fiery red burning energy that flickers with intense heat.', 'auras', 'epic', 350, false, null),
('golden-majesty', 'Golden Majesty', 'Royal golden radiance that shines with divine light.', 'auras', 'legendary', 600, false, null),
('frost-crystal', 'Frost Crystal', 'Icy crystalline aura that sparkles with frozen beauty.', 'auras', 'rare', 250, false, null),
('void-darkness', 'Void Darkness', 'Dark matter distortion field that bends reality itself.', 'auras', 'legendary', 800, false, null),
('rainbow-prism', 'Rainbow Prism', 'Prismatic light spectrum that cycles through rainbow colors.', 'auras', 'legendary', 1000, false, null),
('plasma-storm', 'Plasma Storm', 'Chaotic electrical energy that crackles with unstable power.', 'auras', 'legendary', 1200, false, null)

ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    rarity = EXCLUDED.rarity,
    price = EXCLUDED.price,
    premium_only = EXCLUDED.premium_only,
    unlock_condition = EXCLUDED.unlock_condition,
    updated_at = now();

-- ==========================================
-- 4. DEFAULT USER SETUP
-- ==========================================

-- Grant default cosmetics to all existing users
UPDATE profiles SET 
    unlocked_cosmetics = array_append(unlocked_cosmetics, 'none')
WHERE 'none' != ALL(unlocked_cosmetics) OR unlocked_cosmetics IS NULL;

UPDATE profiles SET 
    unlocked_cosmetics = array_append(unlocked_cosmetics, 'cosmic-aurora')
WHERE 'cosmic-aurora' != ALL(unlocked_cosmetics) OR unlocked_cosmetics IS NULL;

-- Set default aura for users who don't have one equipped
UPDATE profiles SET 
    equipped_effects = array_append(COALESCE(equipped_effects, ARRAY[]::text[]), 'cosmic-aurora')
WHERE 'cosmic-aurora' != ALL(COALESCE(equipped_effects, ARRAY[]::text[])) 
    AND 'none' != ALL(COALESCE(equipped_effects, ARRAY[]::text[]))
    AND (equipped_effects IS NULL OR cardinality(equipped_effects) = 0);

-- ==========================================
-- 5. FUNCTIONS & TRIGGERS
-- ==========================================

-- Function to automatically update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for cosmetics catalog
DROP TRIGGER IF EXISTS update_cosmetics_catalog_updated_at ON cosmetics_catalog;
CREATE TRIGGER update_cosmetics_catalog_updated_at
    BEFORE UPDATE ON cosmetics_catalog
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Function to handle new user registration (grants default cosmetics)
CREATE OR REPLACE FUNCTION handle_new_user_cosmetics()
RETURNS trigger AS $$
BEGIN
    -- Grant default auras
    NEW.unlocked_cosmetics = ARRAY['none', 'cosmic-aurora'];
    NEW.equipped_effects = ARRAY['cosmic-aurora'];
    NEW.stardust = 100;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new user setup
DROP TRIGGER IF EXISTS setup_new_user_cosmetics ON profiles;
CREATE TRIGGER setup_new_user_cosmetics
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user_cosmetics();

-- ==========================================
-- 6. INDEXES FOR PERFORMANCE
-- ==========================================

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_equipped_singularity ON profiles(equipped_singularity);
CREATE INDEX IF NOT EXISTS idx_profiles_equipped_effects ON profiles USING GIN(equipped_effects);
CREATE INDEX IF NOT EXISTS idx_cosmetics_catalog_category ON cosmetics_catalog(category);
CREATE INDEX IF NOT EXISTS idx_cosmetics_catalog_rarity ON cosmetics_catalog(rarity);

-- ==========================================
-- 7. ROW LEVEL SECURITY (if needed)
-- ==========================================

-- Enable RLS on cosmetics catalog (make it readable by all authenticated users)
ALTER TABLE cosmetics_catalog ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read cosmetics catalog
CREATE POLICY "Allow authenticated users to read cosmetics catalog" ON cosmetics_catalog
    FOR SELECT USING (auth.role() = 'authenticated');

-- ==========================================
-- 8. VERIFICATION QUERIES
-- ==========================================

-- Verify the setup
DO $$
BEGIN
    RAISE NOTICE 'Setup complete! Verification:';
    RAISE NOTICE 'Cosmetics in catalog: %', (SELECT count(*) FROM cosmetics_catalog);
    RAISE NOTICE 'Users with default auras: %', (SELECT count(*) FROM profiles WHERE 'cosmic-aurora' = ANY(unlocked_cosmetics));
    RAISE NOTICE 'Aura system ready!';
END
$$;

-- Example queries to verify everything is working:
-- SELECT * FROM cosmetics_catalog WHERE category = 'auras';
-- SELECT user_id, equipped_singularity, equipped_effects, unlocked_cosmetics FROM profiles LIMIT 5;

COMMIT;