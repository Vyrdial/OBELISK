-- Create lesson_completions table to track which lessons users have completed
CREATE TABLE IF NOT EXISTS public.lesson_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL, -- e.g., 'true-false', 'gates-and-tables-1', etc.
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stardust_earned INTEGER DEFAULT 0,
  completion_time_seconds INTEGER, -- How long it took to complete
  UNIQUE(user_id, lesson_id) -- Ensure one completion per user per lesson
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_lesson_completions_user_id ON public.lesson_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_completions_lesson_id ON public.lesson_completions(lesson_id);

-- Grant permissions
GRANT ALL ON public.lesson_completions TO authenticated;
GRANT ALL ON public.lesson_completions TO service_role;

-- Enable RLS
ALTER TABLE public.lesson_completions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own completions" ON public.lesson_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completions" ON public.lesson_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create a function to check if a lesson is completed
CREATE OR REPLACE FUNCTION public.is_lesson_completed(p_user_id UUID, p_lesson_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.lesson_completions
    WHERE user_id = p_user_id AND lesson_id = p_lesson_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to complete a lesson and award stardust (only on first completion)
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
  -- Get the current user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Check if already completed
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
  
  -- Insert completion record
  INSERT INTO public.lesson_completions (user_id, lesson_id, stardust_earned, completion_time_seconds)
  VALUES (v_user_id, p_lesson_id, p_stardust_amount, p_completion_time);
  
  -- Update user's stardust
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

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.is_lesson_completed TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_lesson TO authenticated;