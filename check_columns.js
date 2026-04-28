const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Note: We'd normally need the SERVICE_ROLE key for DDL, but let's try via the UI if this fails.
// Since I can't run DDL via the anon key easily without an RPC, I'll provide the SQL to the user
// OR try to use the MCP one more time if it's a transient error.

console.log('Supabase URL:', supabaseUrl);

async function checkColumns() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Checking columns for "patients" table...');
  
  // Try to select the missing columns to see if they exist
  const { error } = await supabase.from('patients').select('age, gender, updated_at').limit(1);
  
  if (error) {
    if (error.message.includes('column') || error.code === '42703') {
      console.log('Detected missing columns: age, gender, or updated_at');
      return false;
    }
    console.error('Error checking columns:', error);
  } else {
    console.log('All columns exist.');
    return true;
  }
  return false;
}

checkColumns();
