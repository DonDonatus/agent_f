import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions'; 
import type { Session } from 'next-auth';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  const session = (await getServerSession(authOptions)) as Session | null;

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { messages }: { messages: ChatMessage[] } = await req.json();

    if (!Array.isArray(messages) || !messages.every(msg => msg.role && msg.content)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    const prompt = messages
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n') + '\nAssistant:';

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

    const generated = Array.isArray(data) ? data[0]?.generated_text : null;

    if (!response.ok || !generated) {
      console.error('Hugging Face error:', data);
      return NextResponse.json({ error: 'Failed to get valid response from Hugging Face' }, { status: 500 });
    }

    const reply = generated.split('Assistant:').pop()?.trim() || 'No reply.';
    return NextResponse.json({ content: reply });

  } catch (error: unknown) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
