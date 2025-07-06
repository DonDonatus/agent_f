import { prisma } from '../../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface ConversationRequestBody {
  id?: string;
  title: string;
  messages: any[]; // Replace `any[]` with your `Message[]` type if available
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const conversations = await prisma.conversation.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json(conversations);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json()) as ConversationRequestBody;
  const { id, title, messages } = body;

  const timeNow = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (id) {
    const existing = await prisma.conversation.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await prisma.conversation.update({
      where: { id },
      data: {
        title,
        messages,
        time: timeNow,
      },
    });

    return NextResponse.json({ id: updated.id });
  }

  const newConv = await prisma.conversation.create({
    data: {
      userId: session.user.id,
      title,
      messages,
      time: timeNow,
    },
  });

  return NextResponse.json({ id: newConv.id });
}
