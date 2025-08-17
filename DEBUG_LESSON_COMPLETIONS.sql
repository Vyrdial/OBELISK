-- DEBUG SCRIPT FOR LESSON COMPLETIONS
-- Run this in Supabase SQL Editor to see what's happening

-- 1. Check if the table exists and its structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'lesson_completions'
ORDER BY ordinal_position;

-- 2. Check if functions exist
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN (
  'is_lesson_completed', 
  'complete_lesson', 
  'reset_lesson_completions', 
  'get_lesson_stats'
)
ORDER BY routine_name;

-- 3. Check RLS policies
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'lesson_completions'
ORDER BY policyname;

-- 4. View ALL lesson completions (for debugging)
SELECT 
  lc.id,
  lc.user_id,
  p.username,
  p.display_name,
  lc.lesson_id,
  lc.completed_at,
  lc.stardust_earned,
  lc.completion_time_seconds
FROM public.lesson_completions lc
LEFT JOIN public.profiles p ON p.user_id = lc.user_id
ORDER BY lc.completed_at DESC;

-- 5. Test the complete_lesson function manually
-- Replace 'test-lesson' with 'true-false' to test the actual lesson
-- This will complete the lesson for the current authenticated user
SELECT public.complete_lesson('true-false', 30, NULL);

-- 6. Check if the completion was saved
SELECT * FROM public.lesson_completions 
WHERE lesson_id = 'true-false'
ORDER BY completed_at DESC;

-- 7. Get stats for current user
SELECT public.get_lesson_stats();

-- 8. Check current user's profile
SELECT 
  user_id,
  username,
  display_name,
  stardust
FROM public.profiles
WHERE user_id = auth.uid();