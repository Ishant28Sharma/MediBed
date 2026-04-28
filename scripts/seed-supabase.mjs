import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zdfnugcrfyxowzdssyzv.supabase.co';
const supabaseAnonKey = 'sb_publishable_T1XnC5QQX2lxamC1P962iw_w0TQRMb3';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  console.log('Seeding initial MediBed data...');

  // 1. Create Wards
  const { data: wards, error: wardError } = await supabase
    .from('Ward')
    .upsert([
      { name: 'Cardiology', floor: 4, total_beds: 10 },
      { name: 'ICU', floor: 5, total_beds: 10 }
    ], { onConflict: 'name' })
    .select();

  if (wardError) {
    console.error('Error seeding wards:', wardError);
    return;
  }

  const cardiWard = wards.find(w => w.name === 'Cardiology');
  const icuWard = wards.find(w => w.name === 'ICU');

  // 2. Create Beds
  const beds = [];
  for (let i = 1; i <= 5; i++) {
    beds.push({ bed_number: `C-40${i}`, status: 'available', ward_id: cardiWard.id });
    beds.push({ bed_number: `I-50${i}`, status: 'occupied', ward_id: icuWard.id });
  }

  const { error: bedError } = await supabase
    .from('Bed')
    .upsert(beds, { onConflict: 'bed_number' });

  if (bedError) {
    console.error('Error seeding beds:', bedError);
  } else {
    console.log('Successfully seeded wards and beds!');
  }
}

seed();
