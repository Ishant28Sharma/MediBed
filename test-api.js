
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

async function run() {
  try {
    const stream = await ai.models.generateContentStream({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: 'hi' }] }]
    });

    for await (const chunk of stream) {
      console.log(chunk.text);
    }
  } catch (error) {
    console.error(error);
  }
}

run();
