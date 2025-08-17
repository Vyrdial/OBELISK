-- Verify api schema and tables are set up correctly
-- Run this in your Supabase SQL Editor

-- Check if api schema exists
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name = 'api';

-- Check if profiles table exists in api schema
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_schema = 'api' 
AND table_name = 'profiles';

-- Check columns in api.profiles
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'api' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Check if RPC functions exist
SELECT routine_schema, routine_name
FROM information_schema.routines
WHERE routine_schema = 'api'
AND routine_name IN ('get_profile_by_id', 'get_profile_id_from_user_id');

-- Check current schema search path
SHOW search_path;