import { NextResponse } from 'next/server';
import { ai, getCached } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const input = await req.json();
    const { age, condition, ward_pref, mobility } = input;
    
    // Fallback if missing basic args
    if (!age || !condition) {
      return NextResponse.json({ bedId: null, reasoning: 'Invalid input' });
    }

    // 1. Fetch current ward occupancy from standardized 'wards' and 'beds' tables
    const { data: wards, error } = await supabase
      .from('wards')
      .select('*, beds (*)')
      .eq('beds.status', 'available');

    if (error) {
      console.warn('Supabase fetch failed for AI suggestion, using empty wards');
    }

    const dataString = JSON.stringify(wards || []);
    const inputString = JSON.stringify(input);

    // 2. Cache key: SHA of input JSON
    const hash = crypto.createHash('sha256').update(inputString).digest('hex');
    const cacheKey = `bed-suggest:${hash}`;

    const fetchAi = async () => {
      // 3. Build prompt
      const prompt = `Given these hospital wards and available beds data: ${dataString}.
If the data is empty, simulate a 4-ward hospital (General, Cardiology, ICU, Pediatrics).
Suggest the optimal available bed for an incoming patient with the following profile: ${inputString}.
Respond strictly in JSON format matching this schema without markdown formatting: {"bedId": "uuid-string-or-null", "ward": "ward-name", "reasoning": "brief explanation"}`;

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
    console.error('[MediBed AI Suggestion]', error);
    return NextResponse.json({ bedId: null, reasoning: 'AI unavailable' });
  }
}
