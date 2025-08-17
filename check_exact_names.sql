-- Check the EXACT function names
SELECT 
  proname as exact_function_name
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
AND proname LIKE '%lesson%'
ORDER BY proname;