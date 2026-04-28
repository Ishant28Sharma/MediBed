import pg from 'pg';

const connectionString = "postgresql://postgres.zdfnugcrfyxowzdssyzv:zdfnugcrfyxowzdssyzv@ap-southeast-1.pooler.supabase.com:5432/postgres";

async function reload() {
  console.log('Connecting to PostgreSQL to reload PostgREST schema cache...');
  const client = new pg.Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected. Running NOTIFY...');
    await client.query("NOTIFY pgrst, 'reload schema';");
    console.log('Successfully triggered schema reload!');
  } catch (err) {
    console.error('Failed to reload schema:', err);
  } finally {
    await client.end();
  }
}

reload();
