// src/app/api/conversations/route.ts

import { prisma } from '../../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface ConversationRequestBody {
  id?: string;
  title: string;
  messages: Message[];
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const conversations = await prisma.conversation.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('GET /conversations error:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await req.json()) as ConversationRequestBody;
    const { id, title, messages } = body;

    const timeNow = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const messagesJson: Prisma.InputJsonValue = messages?.length
      ? JSON.parse(JSON.stringify(messages))
      : [];

    if (id) {
      const existing = await prisma.conversation.findUnique({ where: { id } });

      if (!existing || existing.userId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const updated = await prisma.conversation.update({
        where: { id },
        data: { title, messages: messagesJson, time: timeNow },
      });

      return NextResponse.json({ id: updated.id });
    }

    const newConv = await prisma.conversation.create({
      data: {
        userId: session.user.id,
        title,
        messages: messagesJson,
        time: timeNow,
      },
    });

    return NextResponse.json({ id: newConv.id });
  } catch (error) {
    console.error('POST /conversations error:', error);
    return NextResponse.json({ error: 'Failed to save conversation' }, { status: 500 });
  }
}
