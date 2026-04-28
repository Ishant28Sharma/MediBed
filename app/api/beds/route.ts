import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: beds, error } = await supabase
      .from('beds')
      .select('*, wards (*)')
      .order('bed_number', { ascending: true });

    if (error) throw error;
    
    // Map to the format the frontend expects
    const formattedBeds = beds?.map(b => ({
      ...b,
      bedNumber: b.bed_number,
      ward: b.wards
    }));

    return NextResponse.json({ beds: formattedBeds || [] });
  } catch (error) {
    console.error('Supabase fetch failed for beds:', error);
    // Fallback logic remains same just in case
    return NextResponse.json({ beds: [] });
  }
}
