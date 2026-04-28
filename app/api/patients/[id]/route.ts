import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 1. Update the patient in standardized 'patients' table
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .update({
        discharged_at: body.dischargedAt,
      })
      .eq('id', id)
      .select()
      .single();

    if (patientError) throw patientError;

    // 2. Handle bed assignment/unassignment in standardized 'beds' table
    if (body.bedId) {
      // Assign to new bed
      await supabase
        .from('beds')
        .update({ patient_id: id, status: 'occupied' })
        .eq('id', body.bedId);
    } else if (body.bedId === null) {
      // Disconnect from current bed
      await supabase
        .from('beds')
        .update({ patient_id: null, status: 'available' })
        .eq('patient_id', id);
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error('Failed to update patient:', error);
    return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 });
  }
}
