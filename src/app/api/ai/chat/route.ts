import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { PRODUCTS } from '@/src/data/products.js';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ success: false, error: 'Pesan diperlukan.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;

    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey !== 'MY_AI_KEY') {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Anda adalah "Florance AI ✦", asisten belanja toko digital FLORANCE.
Katalog: ${PRODUCTS.map((p) => p.name).join(', ')}.
User: ${message}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      return NextResponse.json({
        success: true,
        reply: response.text || 'Halo! Ada yang bisa Florance AI bantu?',
      });
    }

    return NextResponse.json({
      success: true,
      reply: 'Halo 👋 Saya Florance AI. Saya siap membantu menemukan produk pulsa, paket data, bot WhatsApp, dan token digital Anda.',
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: 'AI processing failed' },
      { status: 500 }
    );
  }
}
