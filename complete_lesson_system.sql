-- Complete Lesson Tracking System Setup
-- Run this entire file in Supabase SQL editor

-- 1. Create lesson_completions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.lesson_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stardust_earned INTEGER DEFAULT 0,
  completion_time_seconds INTEGER,
  UNIQUE(user_id, lesson_id)
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_lesson_completions_user_id ON public.lesson_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_completions_lesson_id ON public.lesson_completions(lesson_id);

-- 3. Grant permissions
GRANT ALL ON public.lesson_completions TO authenticated;
GRANT ALL ON public.lesson_completions TO service_role;

-- 4. Enable RLS
ALTER TABLE public.lesson_completions ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
CREATE POLICY "Users can view their own completions" ON public.lesson_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completions" ON public.lesson_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Create function to check if a lesson is completed
CREATE OR REPLACE FUNCTION public.is_lesson_completed(p_user_id UUID, p_lesson_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.lesson_completions
    WHERE user_id = p_user_id AND lesson_id = p_lesson_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create function to complete a lesson and award stardust
CREATE OR REPLACE FUNCTION public.complete_lesson(
  p_lesson_id TEXT,
  p_stardust_amount INTEGER DEFAULT 30,
  p_completion_time INTEGER DEFAULT NULL
)
RETURNS JSON AS $$
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
    SELECT 1 FROM public.lesson_completions
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
  
  INSERT INTO public.lesson_completions (user_id, lesson_id, stardust_earned, completion_time_seconds)
  VALUES (v_user_id, p_lesson_id, p_stardust_amount, p_completion_time);
  
  UPDATE public.profiles
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create function to reset lesson completions
CREATE OR REPLACE FUNCTION public.reset_lesson_completions(p_username TEXT DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_deleted_count INTEGER;
  v_stardust_removed INTEGER;
BEGIN
  IF p_username IS NULL OR p_username = '' THEN
    v_user_id := auth.uid();
  ELSE
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
  
  SELECT COALESCE(SUM(stardust_earned), 0) INTO v_stardust_removed
  FROM public.lesson_completions
  WHERE user_id = v_user_id;
  
  DELETE FROM public.lesson_completions
  WHERE user_id = v_user_id;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
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

-- 9. Create function to get lesson stats
CREATE OR REPLACE FUNCTION public.get_lesson_stats(p_username TEXT DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_total_lessons INTEGER;
  v_total_stardust INTEGER;
  v_lessons JSON;
BEGIN
  IF p_username IS NULL OR p_username = '' THEN
    v_user_id := auth.uid();
  ELSE
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

-- 10. Grant execute permissions on all functions
GRANT EXECUTE ON FUNCTION public.is_lesson_completed TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_lesson TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_lesson_completions TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_lesson_stats TO authenticated;

-- Verify everything was created
SELECT 'Table created: lesson_completions' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lesson_completions');

SELECT 'Function created: ' || routine_name as status
FROM information_schema.routines 
WHERE routine_name IN ('is_lesson_completed', 'complete_lesson', 'reset_lesson_completions', 'get_lesson_stats')
AND routine_schema = 'public';