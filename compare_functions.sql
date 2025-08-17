-- Compare the working function (complete_lesson) with the non-working one (reset_lesson_completions)
SELECT 
  p.proname AS function_name,
  pg_catalog.pg_get_function_identity_arguments(p.oid) AS arguments,
  pg_catalog.pg_get_function_result(p.oid) AS return_type,
  p.prosecdef as security_definer,
  p.provolatile as volatility,
  p.proisstrict as strict,
  p.procost as cost,
  p.prorows as rows,
  p.prosrc as source_first_100_chars
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
AND p.proname IN ('complete_lesson', 'reset_lesson_completions');

-- Check the exact privileges
SELECT 
  proname,
  proacl
FROM pg_proc
WHERE proname IN ('complete_lesson', 'reset_lesson_completions')
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');