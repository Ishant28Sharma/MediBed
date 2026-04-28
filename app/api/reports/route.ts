import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const MOCK_EMAIL = 'evelyn@example.com';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || MOCK_EMAIL;

    // 1. Get the patient's ID from standardized 'patients' table
    let { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('email', email)
      .single();

    if (patientError || !patient) {
      const fallback = await supabase.from('patients').select('id').order('updated_at', { ascending: false }).limit(1).single();
      if (!fallback.data) {
        return NextResponse.json([]);
      }
      patient = fallback.data;
    }

    // 2. Get the patient's documents from standardized 'medical_documents' table
    const { data: documents, error: docsError } = await supabase
      .from('medical_documents')
      .select('*')
      .eq('patient_id', patient.id);

    if (docsError) throw docsError;

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Failed to fetch reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Get the patient's ID
    let { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('email', body.email || MOCK_EMAIL)
      .single();

    if (patientError || !patient) {
      const fallback = await supabase.from('patients').select('id').order('updated_at', { ascending: false }).limit(1).single();
      if (!fallback.data) {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
      }
      patient = fallback.data;
    }

    // 2. Create the document record in standardized 'medical_documents' table
    console.log('[API Reports] POST request body:', body);

    const { data, error } = await supabase
      .from('medical_documents')
      .insert({
        title: body.title,
        type: body.type,
        url: body.url,
        size: body.size,
        date: body.date,
        patient_id: patient.id,
      })
      .select()

    if (error) {
      console.error('[API Reports] Supabase Insert Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[API Reports] Insert success:', data);
    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Failed to create report:', error);
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing report ID' }, { status: 400 });
    }

    const { error } = await supabase
      .from('medical_documents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[API Reports] Supabase Delete Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete report:', error);
    return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 });
  }
}
