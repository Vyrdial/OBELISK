-- Fix missing is_lesson_completed function
-- This function is needed for checking if a lesson has been completed

-- Drop the function if it exists (to recreate it)
DROP FUNCTION IF EXISTS public.is_lesson_completed(UUID, TEXT);

-- Create the function to check if a lesson is completed
CREATE OR REPLACE FUNCTION public.is_lesson_completed(p_user_id UUID, p_lesson_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.lesson_completions
    WHERE user_id = p_user_id AND lesson_id = p_lesson_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_lesson_completed TO authenticated;

-- Test that the function exists
SELECT 'Function created successfully' as status
WHERE EXISTS (
  SELECT 1 FROM information_schema.routines 
  WHERE routine_name = 'is_lesson_completed' 
  AND routine_schema = 'public'
);