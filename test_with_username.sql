-- First, let's find your username
SELECT username, user_id FROM public.profiles LIMIT 5;

-- Then test the function with an actual username
-- Replace 'your_username_here' with one from the above query
-- SELECT public.reset_lesson_completions('your_username_here');

-- Also test the get_lesson_stats function
-- SELECT public.get_lesson_stats('your_username_here');