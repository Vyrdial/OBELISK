-- Create a simpler reset function for current user only
CREATE OR REPLACE FUNCTION public.reset_my_lessons()
RETURNS JSON 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_deleted_count INTEGER;
  v_stardust_removed INTEGER;
  v_username TEXT;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Not authenticated'
    );
  END IF;
  
  -- Get username
  SELECT username INTO v_username
  FROM profiles
  WHERE user_id = v_user_id;
  
  -- Calculate total stardust to remove
  SELECT COALESCE(SUM(stardust_earned), 0) INTO v_stardust_removed
  FROM lesson_completions
  WHERE user_id = v_user_id;
  
  -- Delete all lesson completions for the user
  DELETE FROM lesson_completions
  WHERE user_id = v_user_id;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  -- Remove the stardust that was earned from lessons
  IF v_stardust_removed > 0 THEN
    UPDATE profiles
    SET stardust = GREATEST(0, stardust - v_stardust_removed)
    WHERE user_id = v_user_id;
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'lessons_reset', v_deleted_count,
    'stardust_removed', v_stardust_removed,
    'username', v_username
  );
END;
$$;

-- Grant permission
GRANT EXECUTE ON FUNCTION public.reset_my_lessons() TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_my_lessons() TO anon;

-- Test it exists
SELECT 'reset_my_lessons created' as status
WHERE EXISTS (
  SELECT 1 FROM pg_proc 
  WHERE proname = 'reset_my_lessons'
);