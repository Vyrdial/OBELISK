-- Friends System Database Schema
-- Run this in your Supabase SQL editor

-- 1. Create friendships table
CREATE TABLE IF NOT EXISTS api.friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Ensure users can't friend themselves and no duplicate friendships
  CONSTRAINT no_self_friendship CHECK (requester_id != addressee_id),
  CONSTRAINT unique_friendship UNIQUE (requester_id, addressee_id)
);

-- 2. Create friend requests view (for easier querying)
CREATE OR REPLACE VIEW api.friend_requests AS
SELECT 
  f.id,
  f.requester_id,
  f.addressee_id,
  f.status,
  f.created_at,
  f.updated_at,
  rp.display_name as requester_name,
  rp.username as requester_username,
  COALESCE(rp.equipped_singularity, 'classic-singularity') as requester_avatar,
  ap.display_name as addressee_name,
  ap.username as addressee_username,
  COALESCE(ap.equipped_singularity, 'classic-singularity') as addressee_avatar
FROM api.friendships f
LEFT JOIN public.profiles rp ON f.requester_id = rp.user_id
LEFT JOIN public.profiles ap ON f.addressee_id = ap.user_id;

-- 3. Create friends view (only accepted friendships)
CREATE OR REPLACE VIEW api.friends AS
SELECT 
  f.id,
  f.requester_id,
  f.addressee_id,
  f.created_at,
  f.updated_at,
  rp.display_name as requester_name,
  rp.username as requester_username,
  COALESCE(rp.equipped_singularity, 'classic-singularity') as requester_avatar,
  ap.display_name as addressee_name,
  ap.username as addressee_username,
  COALESCE(ap.equipped_singularity, 'classic-singularity') as addressee_avatar
FROM api.friendships f
LEFT JOIN public.profiles rp ON f.requester_id = rp.user_id
LEFT JOIN public.profiles ap ON f.addressee_id = ap.user_id
WHERE f.status = 'accepted';

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON api.friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON api.friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON api.friendships(status);
CREATE INDEX IF NOT EXISTS idx_friendships_created_at ON api.friendships(created_at);

-- 5. Create updated_at trigger
CREATE OR REPLACE FUNCTION api.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON api.friendships
    FOR EACH ROW EXECUTE FUNCTION api.update_updated_at_column();

-- 6. Row Level Security (RLS) policies
ALTER TABLE api.friendships ENABLE ROW LEVEL SECURITY;

-- Users can see friendships they're involved in
CREATE POLICY "Users can view own friendships" ON api.friendships
    FOR SELECT USING (
        auth.uid() = requester_id OR 
        auth.uid() = addressee_id
    );

-- Users can create friend requests
CREATE POLICY "Users can send friend requests" ON api.friendships
    FOR INSERT WITH CHECK (
        auth.uid() = requester_id AND
        requester_id != addressee_id
    );

-- Users can update friendships they're involved in (accept/decline)
CREATE POLICY "Users can update own friendships" ON api.friendships
    FOR UPDATE USING (
        auth.uid() = requester_id OR 
        auth.uid() = addressee_id
    );

-- Users can delete friendships they're involved in
CREATE POLICY "Users can delete own friendships" ON api.friendships
    FOR DELETE USING (
        auth.uid() = requester_id OR 
        auth.uid() = addressee_id
    );

-- 7. Helper functions

-- Function to get user's friends count
CREATE OR REPLACE FUNCTION api.get_friends_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM api.friendships
        WHERE (requester_id = user_uuid OR addressee_id = user_uuid)
        AND status = 'accepted'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get pending friend requests count
CREATE OR REPLACE FUNCTION api.get_pending_requests_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM api.friendships
        WHERE addressee_id = user_uuid
        AND status = 'pending'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check friendship status between two users
CREATE OR REPLACE FUNCTION api.get_friendship_status(user1_uuid UUID, user2_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    friendship_status TEXT;
BEGIN
    SELECT status INTO friendship_status
    FROM api.friendships
    WHERE (requester_id = user1_uuid AND addressee_id = user2_uuid)
       OR (requester_id = user2_uuid AND addressee_id = user1_uuid);
    
    RETURN COALESCE(friendship_status, 'none');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Grant permissions
GRANT ALL ON api.friendships TO authenticated;
GRANT SELECT ON api.friend_requests TO authenticated;
GRANT SELECT ON api.friends TO authenticated;
GRANT EXECUTE ON FUNCTION api.get_friends_count TO authenticated;
GRANT EXECUTE ON FUNCTION api.get_pending_requests_count TO authenticated;
GRANT EXECUTE ON FUNCTION api.get_friendship_status TO authenticated;