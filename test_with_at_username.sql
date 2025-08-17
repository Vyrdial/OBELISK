-- Test with @ username
SELECT public.reset_lesson_completions('@OBELISK');

-- Also test get_lesson_stats
SELECT public.get_lesson_stats('@OBELISK');

-- Let's also check what lessons this user has completed
SELECT * FROM public.lesson_completions 
WHERE user_id = (SELECT user_id FROM public.profiles WHERE username = '@OBELISK');