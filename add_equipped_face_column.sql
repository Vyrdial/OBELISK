-- Add equipped_face column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS equipped_face TEXT DEFAULT NULL;

-- Grant necessary permissions
GRANT UPDATE (equipped_face) ON profiles TO authenticated;
GRANT SELECT (equipped_face) ON profiles TO authenticated;

-- Update the get_profile_by_id function to include equipped_face
CREATE OR REPLACE FUNCTION get_profile_by_id(p_profile_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  display_name TEXT,
  username TEXT,
  bio TEXT,
  avatar_url TEXT,
  level INTEGER,
  xp INTEGER,
  stardust INTEGER,
  rank TEXT,
  achievements TEXT[],
  favorite_concepts TEXT[],
  learning_paths JSONB,
  equipped_title TEXT,
  equipped_singularity TEXT,
  equipped_effects TEXT[],
  equipped_aura TEXT,
  equipped_crown TEXT,
  equipped_face TEXT,
  is_premium BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.display_name,
    p.username,
    p.bio,
    p.avatar_url,
    p.level,
    p.xp,
    p.stardust,
    p.rank,
    p.achievements,
    p.favorite_concepts,
    p.learning_paths,
    p.equipped_title,
    p.equipped_singularity,
    p.equipped_effects,
    p.equipped_aura,
    p.equipped_crown,
    p.equipped_face,
    p.is_premium,
    p.created_at,
    p.updated_at
  FROM profiles p
  WHERE p.id = p_profile_id;
END;
$$ LANGUAGE plpgsql;

-- Add face cosmetics to cosmetic_items table (if it exists)
-- INSERT INTO cosmetic_items (id, name, description, type, rarity, price) VALUES
-- ('happy-face', 'Happy Face', 'A cheerful expression that radiates positivity.', 'face', 'common', 100),
-- ('cool-face', 'Cool Face', 'Too cool for the cosmic school.', 'face', 'rare', 150),
-- ('starry-eyes', 'Starry Eyes', 'Eyes filled with cosmic wonder.', 'face', 'rare', 200),
-- ('winking-face', 'Winking Face', 'A playful wink for your cosmic adventures.', 'face', 'common', 120),
-- ('thinking-face', 'Thinking Face', 'For when you''re pondering the mysteries of the universe.', 'face', 'rare', 180),
-- ('cosmic-face', 'Cosmic Face', 'A face touched by the stars themselves.', 'face', 'legendary', 500);