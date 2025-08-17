-- Test the reset function directly
-- First, let's see what lessons you have completed
SELECT * FROM public.lesson_completions WHERE user_id = auth.uid();

-- Test calling the function without username (for current user)
SELECT public.reset_lesson_completions();

-- Or test with a specific username (replace 'testuser' with an actual username)
-- SELECT public.reset_lesson_completions('testuser');