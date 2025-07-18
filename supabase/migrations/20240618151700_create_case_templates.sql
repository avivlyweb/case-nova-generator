-- Create case_templates table
CREATE TABLE IF NOT EXISTS public.case_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    patient_name TEXT,
    age INTEGER,
    gender TEXT,
    condition TEXT,
    presenting_complaint TEXT,
    patient_background TEXT,
    adl_problem TEXT,
    psychosocial_factors TEXT,
    specialization TEXT,
    ai_role TEXT DEFAULT 'You are an expert physiotherapist creating detailed case studies.',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.case_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for case_templates
CREATE POLICY "Enable read access for all users" 
ON public.case_templates 
FOR SELECT 
TO authenticated, anon 
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON public.case_templates
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for users based on user_id"
ON public.case_templates
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at column
CREATE TRIGGER update_case_templates_updated_at
BEFORE UPDATE ON public.case_templates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add comments for better documentation
COMMENT ON TABLE public.case_templates IS 'Stores case study templates used for generating full case studies';
COMMENT ON COLUMN public.case_templates.ai_role IS 'The system prompt used for AI generation';
COMMENT ON COLUMN public.case_templates.specialization IS 'The physiotherapy specialization this case belongs to (e.g., orthopedic, neurological)';

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_case_templates_specialization ON public.case_templates(specialization);
