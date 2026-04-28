import { ai } from '@/lib/gemini';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new NextResponse('Bad Request', { status: 400 });
    }

    const systemPrompt = `You are a hospital bed management assistant for MediBed. Context: ${JSON.stringify(context || {})}. Be concise, empathetic, and professional. You do not replace a doctor.`;

    // 1. Format contents for Gemini SDK (GoogleGenAI version)
    // Gemini expects Role: 'user' | 'model' and parts: [{ text: '...' }]
    const contents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text || m.content || '' }] // Fallback to content just in case
    }));

    // Ensure the conversation history starts with a 'user' role
    while (contents.length > 0 && contents[0].role !== 'user') {
      contents.shift();
    }

    if (contents.length === 0) {
      return new NextResponse('Bad Request: Conversation must contain at least one user message', { status: 400 });
    }

    // 2. Generate content stream
    const stream = await ai.models.generateContentStream({
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });

    // 3. Return ReadableStream with Content-Type: text/event-stream
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            // In @google/genai, chunk usually has candidates[0].content.parts[0].text
            // or a more direct .text property if it's the newer wrapper
            const text = chunk.text || chunk.candidates?.[0]?.content?.parts?.[0]?.text || "";
            if (text) {
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err) {
          console.error('[MediBed AI Streaming Error]', err);
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text: " [Streaming interrupted. Please try again.]" })}\n\n`));
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        }
      }
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('[MediBed AI chat endpoint] RAW ERROR:', error);
    return NextResponse.json({ error: String(error?.message), details: String(error) }, { status: 500 });
  }
}
