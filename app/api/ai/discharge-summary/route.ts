import { NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { patientId } = await req.json();

    if (!patientId) {
       return NextResponse.json({ markdown: 'Invalid patientId' });
    }

    // 1. Fetch full patient record from Supabase server-side
    const { data: patientRecord, error } = await supabase
      .from('Patient')
      .select('*, Bed (*, Ward (*))')
      .eq('id', patientId)
      .single();

    if (error || !patientRecord) {
       return NextResponse.json({ markdown: 'Patient not found in Database.' });
    }

    const dataString = JSON.stringify(patientRecord);

    const prompt = `Write a structured discharge summary in markdown format for the following patient data: ${dataString}. 
Include the following sections strictly: Diagnosis, Treatment, Medications, and Follow-up Instructions. Make it professional and clinical.`;

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      contents: prompt
    });

    return NextResponse.json({ markdown: response.text || 'No summary generated.' });

  } catch (error) {
    console.error('[MediBed AI]', error);
    return NextResponse.json({ markdown: 'AI unavailable at this time. Could not generate summary.' });
  }
}
