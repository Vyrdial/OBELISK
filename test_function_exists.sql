-- Check if the function exists and its signature
SELECT 
  p.proname AS function_name,
  pg_catalog.pg_get_function_identity_arguments(p.oid) AS arguments,
  t.typname AS return_type
FROM pg_proc p
LEFT JOIN pg_type t ON p.prorettype = t.oid
WHERE p.proname = 'reset_lesson_completions'
AND p.pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');