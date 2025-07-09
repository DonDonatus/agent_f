// File: src/app/api/conversations/[id]/route.ts
import { prisma } from '../../../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Await the params Promise
  const { id: conversationId } = await params;

  try {
    const existing = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.conversation.delete({
      where: { id: conversationId },
    });

    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.error('DELETE /conversations/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete conversation' },
      { status: 500 }
    );
  }
}