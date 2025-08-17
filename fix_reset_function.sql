-- Drop existing function if it exists (in case of parameter mismatch)
DROP FUNCTION IF EXISTS public.reset_lesson_completions(TEXT);

-- Create the reset function
CREATE OR REPLACE FUNCTION public.reset_lesson_completions(p_username TEXT DEFAULT NULL)
RETURNS JSON 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_deleted_count INTEGER;
  v_stardust_removed INTEGER;
BEGIN
  -- If no username provided, use current user
  IF p_username IS NULL OR p_username = '' THEN
    v_user_id := auth.uid();
  ELSE
    -- Find user by username
    SELECT user_id INTO v_user_id
    FROM public.profiles
    WHERE username = p_username;
    
    IF v_user_id IS NULL THEN
      RETURN json_build_object(
        'success', false,
        'error', format('User "%s" not found', p_username)
      );
    END IF;
  END IF;
  
  -- Make sure we have a user_id
  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'No user found'
    );
  END IF;
  
  -- Calculate total stardust to remove
  SELECT COALESCE(SUM(stardust_earned), 0) INTO v_stardust_removed
  FROM public.lesson_completions
  WHERE user_id = v_user_id;
  
  -- Delete all lesson completions for the user
  DELETE FROM public.lesson_completions
  WHERE user_id = v_user_id;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  -- Remove the stardust that was earned from lessons
  IF v_stardust_removed > 0 THEN
    UPDATE public.profiles
    SET stardust = GREATEST(0, stardust - v_stardust_removed)
    WHERE user_id = v_user_id;
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'lessons_reset', v_deleted_count,
    'stardust_removed', v_stardust_removed,
    'username', COALESCE(p_username, (SELECT username FROM public.profiles WHERE user_id = v_user_id))
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.reset_lesson_completions(TEXT) TO authenticated;

-- Test that the function exists
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name = 'reset_lesson_completions' 
AND routine_schema = 'public';