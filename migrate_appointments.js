const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local
dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log('Starting migration for appointments table...');
  
  // Since we can't run raw SQL easily via the JS client without an RPC,
  // we will try to insert a dummy record to see if the table exists.
  // Actually, I'll use the 'pg' library which is in package.json to run the SQL directly.
  
  const { Client } = require('pg');
  // Construct connection string from Supabase URL (this is a bit hacky but often works if DB is standard)
  // Or better, I'll just use the REST API to check.
  
  console.log('Checking if appointments table exists...');
  const { error: checkError } = await supabase.from('appointments').select('id').limit(1);
  
  if (checkError && checkError.code === 'PGRST204') {
    console.log('Table "appointments" not found. Please create it manually or use the SQL Editor in Supabase Dashboard.');
    console.log('SQL to run:');
    console.log(`
      CREATE TABLE IF NOT EXISTS public.appointments (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          patient_id UUID REFERENCES public.patients(id),
          doctor_id TEXT,
          doctor_name TEXT,
          specialty TEXT,
          hospital_name TEXT,
          appointment_date DATE,
          appointment_time TEXT,
          status TEXT DEFAULT 'pending',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      GRANT ALL ON public.appointments TO anon, authenticated, service_role;
      NOTIFY pgrst, 'reload schema';
    `);
    process.exit(1);
  } else {
    console.log('Table "appointments" exists or failed with a different error.');
  }
}

migrate();
