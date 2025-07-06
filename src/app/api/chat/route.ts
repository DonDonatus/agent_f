import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import type { Session } from 'next-auth';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions) as Session;

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { messages } = body;

    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    // Convert chat format messages to a single prompt (Mistral doesn't support OpenAI format directly)
    const prompt = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n') + '\nAssistant:';

    const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          temperature: 0.7,
          max_new_tokens: 200,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok || !data || !Array.isArray(data) || !data[0]?.generated_text) {
      console.error('Hugging Face error:', data);
      return NextResponse.json({ error: 'Failed to get valid response from Hugging Face' }, { status: 500 });
    }

    const reply = data[0].generated_text.split('Assistant:').pop()?.trim() || 'No reply.';
    return NextResponse.json({ content: reply });

  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
