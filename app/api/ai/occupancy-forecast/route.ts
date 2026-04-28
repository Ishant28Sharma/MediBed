import { NextResponse } from 'next/server';
import { ai, getCached } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // 1. Query last 30 days of bed data from standardized 'bed_status_logs'
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: historicalLogs, error } = await supabase
      .from('bed_status_logs')
      .select(`
        *,
        beds (
          *,
          wards (*)
        )
      `)
      .gte('timestamp', thirtyDaysAgo.toISOString());

    if (error) {
      console.warn('Supabase fetch failed for AI logs, using empty history');
    }

    const dataString = JSON.stringify(historicalLogs || []);

    // 2. Cache key: 'forecast:' + today's date string
    const todayStr = new Date().toISOString().split('T')[0];
    const cacheKey = `forecast:${todayStr}`;

    const fetchForecast = async () => {
      const prompt = `Based on this 30-day occupancy history: ${dataString}.
If the history is empty, generate a realistic hypothetical forecast for a 100-bed hospital.
Predict the next 7 days of occupancy per ward (General, Cardiology, ICU, Pediatrics).
Respond ONLY in JSON array format matching this Recharts-compatible schema, using "date" as a short string (e.g. "Mon", "Tue") and "predicted_occupancy" as integer:
[{"date": "Mon", "ward": "Cardiology", "predicted_occupancy": 45}]`;

      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
        contents: prompt
      });

      let responseText = response.text || '[]';
      responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(responseText);
    };

    const result = await getCached(cacheKey, fetchForecast);
    return NextResponse.json(result);

  } catch (error) {
    console.error('[MediBed AI Forecasting]', error);
    return NextResponse.json([{ date: 'Err', ward: 'Error', predicted_occupancy: 0 }]);
  }
}
