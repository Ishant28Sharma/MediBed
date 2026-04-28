import { GoogleGenAI } from '@google/genai';
import redis from '@/lib/redis';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export async function getCached(key: string, fn: () => Promise<any>) {
  try {
    await redis.connect().catch(() => {}); // lazy connect, ignore if already connected or fails
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);
    
    const result = await fn();
    await redis.set(key, JSON.stringify(result), 'EX', Number(process.env.AI_CACHE_TTL ?? 300));
    return result;
  } catch (error) {
    // If Redis fails, fallback gracefully to the original function
    console.warn('[Redis Cache Warning]', (error as Error).message);
    return await fn();
  }
}

export { ai };
