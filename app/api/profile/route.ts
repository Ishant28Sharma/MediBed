import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // 1. Prioritize the most recently updated record.
    // In a development/single-user environment, this ensures the user's latest 
    // changes (like saving 'Ishant') are what they see on the portal.
    const { data: allPatients, error: listError } = await supabase
      .from('patients')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1);

    if (listError || !allPatients || allPatients.length === 0) {
      // Fallback if DB is empty
      return NextResponse.json({
        id: 'mock-uuid',
        name: 'Alexander Pierce',
        email: 'evelyn@example.com',
        phone: '+1 (555) 123-4567',
        blood_type: 'B+',
        age: 30,
        gender: 'Male',
        allergies: 'None'
      });
    }

    // Add legacy support for bloodType if existing components use camelCase
    const patientData = {
      ...allPatients[0],
      bloodType: allPatients[0].blood_type
    };

    return NextResponse.json(patientData);
  } catch (error) {
    console.error('[API Profile] GET Failure:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const patientId = body.id;

    console.log('[API Profile] Synchronizing patient identity:', patientId || body.email);
    
    // 1. Prepare clinical payload
    const payload: any = {
      name: body.name,
      email: body.email,
      phone: body.phone,
      blood_type: body.blood_type || body.bloodType,
      allergies: body.allergies,
      age: parseInt(body.age) || 0,
      gender: body.gender || 'Other',
      updated_at: new Date().toISOString(),
    };

    let result;
    
    // 2. Identification Logic:
    // Email is now the primary key. Always upsert based on email.
    if (!body.email) {
      throw new Error('Email is required as it is the primary identity key.');
    }

    const { data, error } = await supabase
      .from('patients')
      .upsert({ ...payload }, { onConflict: 'email' })
      .select();
    
    if (error) throw error;
    result = data[0];

    if (!result) {
      throw new Error('Synchronization yielded no result.');
    }

    // Return the updated result clearly
    return NextResponse.json({
      ...result,
      bloodType: result.blood_type
    });
  } catch (error: any) {
    console.error('[API Profile] Synchronization Failure:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
