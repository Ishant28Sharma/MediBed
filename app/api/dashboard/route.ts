import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // 1. Get total beds
    const { count: totalBeds, error: totalError } = await supabase
      .from('beds')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    // 2. Get available beds
    const { count: availableBeds, error: availableError } = await supabase
      .from('beds')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'available');

    if (availableError) throw availableError;

    // 3. Get ward count
    const { count: wardCount, error: wardError } = await supabase
      .from('wards')
      .select('*', { count: 'exact', head: true });

    if (wardError) throw wardError;

    return NextResponse.json({
      totalBeds: totalBeds || 0,
      occupiedBeds: (totalBeds || 0) - (availableBeds || 0),
      availableBeds: availableBeds || 0,
      wardCount: wardCount || 0
    });
  } catch (error) {
    console.error('Failed to fetch dashboard counts:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard counts' }, { status: 500 });
  }
}
