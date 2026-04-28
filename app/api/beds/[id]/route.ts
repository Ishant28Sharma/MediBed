import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import redis from '@/lib/redis';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const { data: bed, error } = await supabase
      .from('beds')
      .select('*, wards (*), patients (*), bed_status_logs (*)')
      .eq('id', id)
      .single();

    if (error || !bed) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    // Map back to camelCase for UI compatibility
    const formattedBed = {
      ...bed,
      bedNumber: bed.bed_number,
      ward: bed.wards,
      patient: bed.patients,
      statusLogs: bed.bed_status_logs?.map((log: any) => ({
        id: log.id,
        bedId: log.bed_id,
        oldStatus: log.old_status,
        newStatus: log.new_status,
        changedAt: log.timestamp
      }))
    };

    return NextResponse.json(formattedBed);
  } catch (error) {
    console.error('Failed to fetch bed:', error);
    return NextResponse.json({ error: 'Failed to fetch bed' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // 1. Get current status for logging
    const { data: currentBed } = await supabase
      .from('beds')
      .select('status')
      .eq('id', id)
      .single();

    // 2. Update the bed in standardized 'beds' table
    const { data: bed, error: bedError } = await supabase
      .from('beds')
      .update({ 
        status: body.status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();

    if (bedError) throw bedError;
    
    // 3. Log the status change in standardized 'bed_status_logs' table
    await supabase.from('bed_status_logs').insert({
      bed_id: id,
      old_status: currentBed?.status || 'unknown',
      new_status: body.status
    });

    // 4. Redis pub/sub (optional/demo)
    if (redis) {
      try {
        await redis.publish('bed-updates', JSON.stringify(bed));
      } catch (e) {
        console.warn('Redis publish failed:', e);
      }
    }

    return NextResponse.json(bed);
  } catch (error) {
    console.error('Failed to update bed:', error);
    return NextResponse.json({ error: 'Failed to update bed' }, { status: 500 });
  }
}
