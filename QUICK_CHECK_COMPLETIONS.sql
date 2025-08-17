-- QUICK CHECK: See if your lesson completions are saved
-- Run this in Supabase SQL Editor

-- 1. Show ALL lesson completions with usernames
SELECT 
  p.username,
  p.display_name,
  lc.lesson_id,
  lc.completed_at,
  lc.stardust_earned
FROM public.lesson_completions lc
JOIN public.profiles p ON p.user_id = lc.user_id
ORDER BY lc.completed_at DESC
LIMIT 20;

-- 2. Check specifically for 'true-false' lesson
SELECT 
  p.username,
  lc.lesson_id,
  lc.completed_at,
  lc.stardust_earned
FROM public.lesson_completions lc
JOIN public.profiles p ON p.user_id = lc.user_id
WHERE lc.lesson_id = 'true-false'
ORDER BY lc.completed_at DESC;

-- 3. Check your current user's completions
SELECT 
  lesson_id,
  completed_at,
  stardust_earned
FROM public.lesson_completions
WHERE user_id = auth.uid()
ORDER BY completed_at DESC;

-- 4. If nothing shows up, manually complete the lesson
-- This will tell us if the function works
SELECT public.complete_lesson('true-false', 30, NULL) as result;