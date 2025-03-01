-- Create vehicles table
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  color TEXT NOT NULL,
  license_plate TEXT NOT NULL,
  vehicle_type TEXT NOT NULL DEFAULT 'sedan',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Policy for users to select their own vehicles
CREATE POLICY "Users can view their own vehicles" 
  ON public.vehicles 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy for users to insert their own vehicles
CREATE POLICY "Users can insert their own vehicles" 
  ON public.vehicles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own vehicles
CREATE POLICY "Users can update their own vehicles" 
  ON public.vehicles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy for users to delete their own vehicles
CREATE POLICY "Users can delete their own vehicles" 
  ON public.vehicles 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add indexes
CREATE INDEX vehicles_user_id_idx ON public.vehicles (user_id); 