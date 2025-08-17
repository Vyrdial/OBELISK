-- Check what functions are actually exposed to the API
-- This shows what PostgREST can see
SELECT 
  routine_name as function_name,
  routine_schema,
  specific_name
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Specifically check our functions
SELECT 
  routine_name as function_name,
  routine_type,
  data_type as returns
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN ('reset_lesson_completions', 'get_lesson_stats', 'complete_lesson', 'is_lesson_completed');

-- Check if there's something special about a function that DOES work
-- Let's check the complete_lesson function that we know works
SELECT 
  p.proname AS function_name,
  pg_catalog.pg_get_function_identity_arguments(p.oid) AS arguments,
  p.prosecdef as security_definer,
  p.provolatile as volatility
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
AND p.proname IN ('complete_lesson', 'reset_lesson_completions');