-- Check if the function is in the public schema and accessible
SELECT 
  n.nspname as schema,
  p.proname as function_name,
  pg_catalog.pg_get_function_identity_arguments(p.oid) as arguments,
  p.prosecdef as security_definer,
  p.proacl as permissions
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE p.proname IN ('reset_lesson_completions', 'get_lesson_stats', 'complete_lesson', 'is_lesson_completed')
AND n.nspname = 'public';

-- Also check what functions are exposed via PostgREST
SELECT 
  routine_name,
  routine_schema,
  data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%lesson%';