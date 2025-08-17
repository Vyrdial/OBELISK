-- Fix the search path to include api schema
-- Run this in your Supabase SQL Editor

-- Set the search path for the current session
SET search_path TO api, "$user", public, extensions;

-- To make it permanent for the database, you can alter the database:
-- Note: You might need superuser permissions for this
ALTER DATABASE postgres SET search_path TO api, "$user", public, extensions;

-- Alternatively, set it for specific roles
ALTER ROLE anon SET search_path TO api, "$user", public, extensions;
ALTER ROLE authenticated SET search_path TO api, "$user", public, extensions;
ALTER ROLE service_role SET search_path TO api, "$user", public, extensions;

-- Verify the change
SHOW search_path;

-- Test that tables can be found without schema prefix
SELECT COUNT(*) FROM profiles;

SELECT 'Search path updated! The api schema is now in the search path.' as status;