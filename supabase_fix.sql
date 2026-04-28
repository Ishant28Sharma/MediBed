-- MediBed Schema Upgrade: Patients Table
-- Execute this in your Supabase Dashboard SQL Editor to solve the settings update issue.

-- 1. Ensure the patient email is unique for upsert logic
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'patients_email_key') THEN
        ALTER TABLE public.patients ADD CONSTRAINT patients_email_key UNIQUE (email);
    END IF;
END $$;

-- 2. Add missing profile columns 
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS age INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'Other',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Grant permissions for all operations
GRANT ALL ON public.patients TO anon, authenticated, service_role;

-- 4. Reload the schema cache to reflect changes immediately
NOTIFY pgrst, 'reload schema';
