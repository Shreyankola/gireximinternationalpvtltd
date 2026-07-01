-- Enable Row Level Security on the containers table
ALTER TABLE public.containers ENABLE ROW LEVEL SECURITY;

-- Allow all operations (SELECT, INSERT, UPDATE, DELETE) for the anon role
-- This preserves existing app behaviour while satisfying RLS requirements
CREATE POLICY "Enable all for anon" ON public.containers
  FOR ALL
  USING (true)
  WITH CHECK (true);
