-- Create table for tracking unlocked concepts
CREATE TABLE IF NOT EXISTS public.unlocked_concepts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  concept_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, concept_id)
);

-- Enable RLS
ALTER TABLE public.unlocked_concepts ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own unlocked concepts
CREATE POLICY "Users can manage their own unlocked concepts"
  ON public.unlocked_concepts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_unlocked_concepts_user_id ON public.unlocked_concepts(user_id);
CREATE INDEX idx_unlocked_concepts_concept_id ON public.unlocked_concepts(concept_id);

-- Create function to unlock a concept
CREATE OR REPLACE FUNCTION public.unlock_concept(p_concept_id TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.unlocked_concepts (user_id, concept_id)
  VALUES (auth.uid(), p_concept_id)
  ON CONFLICT (user_id, concept_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get all unlocked concepts for current user
CREATE OR REPLACE FUNCTION public.get_unlocked_concepts()
RETURNS TABLE(concept_id TEXT, unlocked_at TIMESTAMP WITH TIME ZONE) AS $$
BEGIN
  RETURN QUERY
  SELECT uc.concept_id, uc.unlocked_at
  FROM public.unlocked_concepts uc
  WHERE uc.user_id = auth.uid()
  ORDER BY uc.unlocked_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if a concept is unlocked
CREATE OR REPLACE FUNCTION public.is_concept_unlocked(p_concept_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.unlocked_concepts
    WHERE user_id = auth.uid() AND concept_id = p_concept_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;