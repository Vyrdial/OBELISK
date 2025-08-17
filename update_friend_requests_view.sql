-- Update friend_requests view to include equipped_singularity fields
-- This script updates the friend_requests view to include equipped_singularity 
-- from both requester and addressee profiles

-- 1. Drop the existing friend_requests view if it exists
DROP VIEW IF EXISTS api.friend_requests;

-- 2. Create the updated friend_requests view with equipped_singularity fields
CREATE OR REPLACE VIEW api.friend_requests AS
SELECT 
  f.id,
  f.requester_id,
  f.addressee_id,
  f.status,
  f.created_at,
  f.updated_at,
  -- Requester profile information
  rp.display_name as requester_name,
  rp.username as requester_username,
  rp.equipped_singularity as requester_equipped_singularity,
  -- Addressee profile information
  ap.display_name as addressee_name,
  ap.username as addressee_username,
  ap.equipped_singularity as addressee_equipped_singularity
FROM api.friendships f
LEFT JOIN api.profiles rp ON f.requester_id = rp.user_id
LEFT JOIN api.profiles ap ON f.addressee_id = ap.user_id;

-- 3. Grant permissions for the updated view
GRANT SELECT ON api.friend_requests TO authenticated;

-- 4. Optional: Also update the friends view to maintain consistency
DROP VIEW IF EXISTS api.friends;

CREATE OR REPLACE VIEW api.friends AS
SELECT 
  f.id,
  f.requester_id,
  f.addressee_id,
  f.created_at,
  f.updated_at,
  -- Requester profile information
  rp.display_name as requester_name,
  rp.username as requester_username,
  rp.equipped_singularity as requester_equipped_singularity,
  -- Addressee profile information
  ap.display_name as addressee_name,
  ap.username as addressee_username,
  ap.equipped_singularity as addressee_equipped_singularity
FROM api.friendships f
LEFT JOIN api.profiles rp ON f.requester_id = rp.user_id
LEFT JOIN api.profiles ap ON f.addressee_id = ap.user_id
WHERE f.status = 'accepted';

-- 5. Grant permissions for the updated friends view
GRANT SELECT ON api.friends TO authenticated;