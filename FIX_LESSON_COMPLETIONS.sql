-- COMPREHENSIVE FIX FOR LESSON COMPLETION SYSTEM
-- Run this entire script in Supabase SQL Editor to fix all issues

-- ============================================
-- STEP 1: DROP AND RECREATE EVERYTHING CLEANLY
-- ============================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own completions" ON public.lesson_completions;
DROP POLICY IF EXISTS "Users can insert their own completions" ON public.lesson_completions;
DROP POLICY IF EXISTS "Users can update their own completions" ON public.lesson_completions;
DROP POLICY IF EXISTS "Users can delete their own completions" ON public.lesson_completions;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.is_lesson_completed(UUID, TEXT);
DROP FUNCTION IF EXISTS public.complete_lesson(TEXT, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS public.reset_lesson_completions(TEXT);
DROP FUNCTION IF EXISTS public.get_lesson_stats(TEXT);

-- Drop and recreate the table
DROP TABLE IF EXISTS public.lesson_completions CASCADE;

-- ============================================
-- STEP 2: CREATE THE TABLE
-- ============================================

CREATE TABLE public.lesson_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stardust_earned INTEGER DEFAULT 0,
  completion_time_seconds INTEGER,
  UNIQUE(user_id, lesson_id)
);

-- Create indexes for performance
CREATE INDEX idx_lesson_completions_user_id ON public.lesson_completions(user_id);
CREATE INDEX idx_lesson_completions_lesson_id ON public.lesson_completions(lesson_id);
CREATE INDEX idx_lesson_completions_completed_at ON public.lesson_completions(completed_at);

-- Enable RLS
ALTER TABLE public.lesson_completions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: CREATE RLS POLICIES
-- ============================================

-- Users can view their own completions
CREATE POLICY "Users can view their own completions" 
ON public.lesson_completions
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own completions
CREATE POLICY "Users can insert their own completions" 
ON public.lesson_completions
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own completions
CREATE POLICY "Users can update their own completions" 
ON public.lesson_completions
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own completions (for reset)
CREATE POLICY "Users can delete their own completions" 
ON public.lesson_completions
FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================
-- STEP 4: CREATE FUNCTIONS
-- ============================================

-- Function to check if a lesson is completed
CREATE OR REPLACE FUNCTION public.is_lesson_completed(
  p_user_id UUID, 
  p_lesson_id TEXT
)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.lesson_completions
    WHERE user_id = p_user_id 
    AND lesson_id = p_lesson_id
  );
END;
$$;

-- Function to complete a lesson
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
  v_profile_exists BOOLEAN;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  -- Check if authenticated
  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Not authenticated'
    );
  END IF;
  
  -- Check if profile exists
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = v_user_id
  ) INTO v_profile_exists;
  
  IF NOT v_profile_exists THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Profile not found'
    );
  END IF;
  
  -- Check if already completed
  SELECT EXISTS (
    SELECT 1 
    FROM public.lesson_completions
    WHERE user_id = v_user_id 
    AND lesson_id = p_lesson_id
  ) INTO v_already_completed;
  
  -- If already completed, return success but no stardust
  IF v_already_completed THEN
    SELECT stardust INTO v_current_stardust
    FROM public.profiles
    WHERE user_id = v_user_id;
    
    RETURN json_build_object(
      'success', true, 
      'first_completion', false,
      'stardust_earned', 0,
      'total_stardust', v_current_stardust,
      'message', 'Lesson already completed'
    );
  END IF;
  
  -- Insert completion record
  INSERT INTO public.lesson_completions (
    user_id, 
    lesson_id, 
    stardust_earned, 
    completion_time_seconds
  )
  VALUES (
    v_user_id, 
    p_lesson_id, 
    p_stardust_amount, 
    p_completion_time
  );
  
  -- Update stardust in profile
  UPDATE public.profiles
  SET stardust = COALESCE(stardust, 0) + p_stardust_amount
  WHERE user_id = v_user_id
  RETURNING stardust INTO v_current_stardust;
  
  -- Return success response
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

-- Function to reset lesson completions
CREATE OR REPLACE FUNCTION public.reset_lesson_completions(
  p_username TEXT DEFAULT NULL
)
RETURNS JSON 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_deleted_count INTEGER;
  v_stardust_removed INTEGER;
  v_actual_username TEXT;
BEGIN
  -- Determine which user to reset
  IF p_username IS NULL OR p_username = '' THEN
    -- Reset current user
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
      RETURN json_build_object(
        'success', false,
        'error', 'Not authenticated'
      );
    END IF;
    
    -- Get username for response
    SELECT username INTO v_actual_username
    FROM public.profiles
    WHERE user_id = v_user_id;
  ELSE
    -- Reset specified user
    SELECT user_id, username 
    INTO v_user_id, v_actual_username
    FROM public.profiles
    WHERE LOWER(username) = LOWER(p_username);
    
    IF v_user_id IS NULL THEN
      RETURN json_build_object(
        'success', false,
        'error', format('User "%s" not found', p_username)
      );
    END IF;
  END IF;
  
  -- Calculate stardust to remove
  SELECT COALESCE(SUM(stardust_earned), 0) 
  INTO v_stardust_removed
  FROM public.lesson_completions
  WHERE user_id = v_user_id;
  
  -- Delete all completions for this user
  DELETE FROM public.lesson_completions
  WHERE user_id = v_user_id;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  -- Remove stardust from profile
  IF v_stardust_removed > 0 THEN
    UPDATE public.profiles
    SET stardust = GREATEST(0, COALESCE(stardust, 0) - v_stardust_removed)
    WHERE user_id = v_user_id;
  END IF;
  
  -- Return result
  RETURN json_build_object(
    'success', true,
    'lessons_reset', v_deleted_count,
    'stardust_removed', v_stardust_removed,
    'username', v_actual_username,
    'message', format('Reset %s lessons for %s', v_deleted_count, v_actual_username)
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Function to get lesson stats
CREATE OR REPLACE FUNCTION public.get_lesson_stats(
  p_username TEXT DEFAULT NULL
)
RETURNS JSON 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_total_lessons INTEGER;
  v_total_stardust INTEGER;
  v_lessons JSON;
  v_actual_username TEXT;
BEGIN
  -- Determine which user to get stats for
  IF p_username IS NULL OR p_username = '' THEN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
      RETURN json_build_object(
        'success', false,
        'error', 'Not authenticated'
      );
    END IF;
    
    SELECT username INTO v_actual_username
    FROM public.profiles
    WHERE user_id = v_user_id;
  ELSE
    SELECT user_id, username 
    INTO v_user_id, v_actual_username
    FROM public.profiles
    WHERE LOWER(username) = LOWER(p_username);
    
    IF v_user_id IS NULL THEN
      RETURN json_build_object(
        'success', false,
        'error', format('User "%s" not found', p_username)
      );
    END IF;
  END IF;
  
  -- Get stats
  SELECT 
    COUNT(*),
    COALESCE(SUM(stardust_earned), 0),
    COALESCE(
      json_agg(
        json_build_object(
          'lesson_id', lesson_id,
          'completed_at', completed_at,
          'stardust_earned', stardust_earned,
          'completion_time', completion_time_seconds
        ) ORDER BY completed_at DESC
      ),
      '[]'::json
    )
  INTO v_total_lessons, v_total_stardust, v_lessons
  FROM public.lesson_completions
  WHERE user_id = v_user_id;
  
  RETURN json_build_object(
    'success', true,
    'username', v_actual_username,
    'total_lessons_completed', COALESCE(v_total_lessons, 0),
    'total_stardust_earned', COALESCE(v_total_stardust, 0),
    'lessons', v_lessons
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- ============================================
-- STEP 5: GRANT PERMISSIONS
-- ============================================

-- Grant table permissions
GRANT ALL ON public.lesson_completions TO authenticated;
GRANT ALL ON public.lesson_completions TO service_role;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION public.is_lesson_completed TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_lesson TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_lesson_completions TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_lesson_stats TO authenticated;

-- ============================================
-- STEP 6: VERIFY EVERYTHING IS WORKING
-- ============================================

-- Check if table exists
SELECT 
  'Table: lesson_completions' as component,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'lesson_completions'
    ) THEN '✅ Created' 
    ELSE '❌ Missing' 
  END as status;

-- Check if functions exist
SELECT 
  'Function: ' || routine_name as component,
  '✅ Created' as status
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN (
  'is_lesson_completed', 
  'complete_lesson', 
  'reset_lesson_completions', 
  'get_lesson_stats'
)
ORDER BY routine_name;

-- Check RLS policies
SELECT 
  'Policy: ' || policyname as component,
  '✅ Created' as status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'lesson_completions'
ORDER BY policyname;

-- Test the functions (optional - comment out if you don't want to test)
-- This will test with the current authenticated user
/*
-- Test completing a lesson
SELECT public.complete_lesson('test-lesson', 50);

-- Test getting stats
SELECT public.get_lesson_stats();

-- Test resetting (be careful!)
-- SELECT public.reset_lesson_completions();
*/

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT '🎉 Lesson completion system has been fixed and is ready to use!' as message;