-- Create table to track display name changes
CREATE TABLE IF NOT EXISTS public.display_name_changes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  old_name TEXT,
  new_name TEXT NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX idx_display_name_changes_user_id ON public.display_name_changes(user_id);
CREATE INDEX idx_display_name_changes_changed_at ON public.display_name_changes(changed_at DESC);

-- Enable RLS
ALTER TABLE public.display_name_changes ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own name changes
CREATE POLICY "Users can view own name changes" ON public.display_name_changes
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own name changes (handled by API with additional checks)
CREATE POLICY "Users can insert own name changes" ON public.display_name_changes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.display_name_changes TO authenticated;

-- Function to clean up old name change records (older than 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_name_changes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.display_name_changes
  WHERE changed_at < NOW() - INTERVAL '7 days';
END;
$$;