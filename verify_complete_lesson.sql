-- Check if complete_lesson function exists
SELECT 
  proname as function_name,
  pg_catalog.pg_get_function_identity_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
AND p.proname = 'complete_lesson';

-- If it doesn't exist, create it
CREATE OR REPLACE FUNCTION public.complete_lesson(
  p_lesson_id TEXT,
  p_stardust_amount INTEGER DEFAULT 30,
  p_completion_time INTEGER DEFAULT NULL
)
RETURNS JSON 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_already_completed BOOLEAN;
  v_current_stardust INTEGER;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  SELECT EXISTS (
    SELECT 1 FROM lesson_completions
    WHERE user_id = v_user_id AND lesson_id = p_lesson_id
  ) INTO v_already_completed;
  
  IF v_already_completed THEN
    RETURN json_build_object(
      'success', true, 
      'first_completion', false,
      'stardust_earned', 0,
      'message', 'Lesson already completed'
    );
  END IF;
  
  INSERT INTO lesson_completions (user_id, lesson_id, stardust_earned, completion_time_seconds)
  VALUES (v_user_id, p_lesson_id, p_stardust_amount, p_completion_time);
  
  UPDATE profiles
  SET stardust = stardust + p_stardust_amount
  WHERE user_id = v_user_id
  RETURNING stardust INTO v_current_stardust;
  
  RETURN json_build_object(
    'success', true,
    'first_completion', true,
    'stardust_earned', p_stardust_amount,
    'total_stardust', v_current_stardust,
    'message', 'Lesson completed successfully!'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Grant permission
GRANT EXECUTE ON FUNCTION public.complete_lesson TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_lesson TO anon;

-- Verify it was created
SELECT 'complete_lesson function created/verified' as status;