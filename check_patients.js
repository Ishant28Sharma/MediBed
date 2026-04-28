const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function cleanAndCheck() {
  console.log('--- MediBed Double-Record Audit ---');
  
  const { data: patients, error } = await supabase
    .from('patients')
    .select('name, email, updated_at')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Query Error:', error.message);
    return;
  }

  console.log(`Found ${patients.length} patient records:`);
  patients.forEach((p, i) => {
    console.log(`[${i}] Email: ${p.email} | Name: ${p.name} | Updated: ${p.updated_at}`);
  });

  if (patients.length > 1) {
    console.log('\nDUPLICATES DETECTED. The portal is currently seeing the oldest record.');
    console.log('Recommended Action: DELETE OLD RECORDS.');
  }
}

cleanAndCheck();
