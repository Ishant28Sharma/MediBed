import { NextResponse } from 'next/server';
import { ai, getCached } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { patientId, vitals } = await req.json();
    
    if (!patientId || !vitals || !vitals.length) {
      return NextResponse.json({ summary: 'No vitals provided.', flags: [] });
    }

    // Cache key: patientId + most recent timestamp
    const mostRecentTimestamp = vitals[0]?.timestamp || Date.now().toString();
    const cacheKey = `biometric-summary:${patientId}:${mostRecentTimestamp}`;

    const fetchAi = async () => {
      const prompt = `Summarize these patient vitals in 2 plain-English sentences for a clinician. Flag any critical anomalies. 
Vitals data: ${JSON.stringify(vitals)}
Respond strictly in JSON format matching this schema without markdown brackets: {"summary": "string", "flags": ["string", "string"]}`;

      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
        contents: prompt
      });

      let responseText = response.text || '{}';
      responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(responseText);
    };

    const result = await getCached(cacheKey, fetchAi);
    return NextResponse.json(result);

  } catch (error) {
    console.error('[MediBed AI]', error);
    return NextResponse.json({ summary: 'AI unavailable', flags: [] }, { status: 200 }); // Still returns 200 to not break core UI
  }
}
