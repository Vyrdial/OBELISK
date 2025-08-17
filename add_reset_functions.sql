-- Add the reset and stats functions for lesson completions

-- 1. Function to reset lesson completions for a user
CREATE OR REPLACE FUNCTION public.reset_lesson_completions(p_username TEXT DEFAULT NULL)
RETURNS JSON AS $$
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Function to get lesson completion stats for a user
CREATE OR REPLACE FUNCTION public.get_lesson_stats(p_username TEXT DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_total_lessons INTEGER;
  v_total_stardust INTEGER;
  v_lessons JSON;
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
  
  -- Get completion stats
  SELECT 
    COUNT(*),
    COALESCE(SUM(stardust_earned), 0),
    json_agg(json_build_object(
      'lesson_id', lesson_id,
      'completed_at', completed_at,
      'stardust_earned', stardust_earned
    ) ORDER BY completed_at DESC)
  INTO v_total_lessons, v_total_stardust, v_lessons
  FROM public.lesson_completions
  WHERE user_id = v_user_id;
  
  RETURN json_build_object(
    'success', true,
    'username', COALESCE(p_username, (SELECT username FROM public.profiles WHERE user_id = v_user_id)),
    'total_lessons_completed', COALESCE(v_total_lessons, 0),
    'total_stardust_earned', COALESCE(v_total_stardust, 0),
    'lessons', COALESCE(v_lessons, '[]'::json)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Grant execute permissions
GRANT EXECUTE ON FUNCTION public.reset_lesson_completions TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_lesson_stats TO authenticated;

-- 4. Verify the functions were created
SELECT 'reset_lesson_completions created' as status
WHERE EXISTS (
  SELECT 1 FROM information_schema.routines 
  WHERE routine_name = 'reset_lesson_completions' 
  AND routine_schema = 'public'
);

SELECT 'get_lesson_stats created' as status
WHERE EXISTS (
  SELECT 1 FROM information_schema.routines 
  WHERE routine_name = 'get_lesson_stats' 
  AND routine_schema = 'public'
);