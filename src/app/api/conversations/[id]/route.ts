// app/api/conversations/[id]/route.ts
import { prisma } from '../../../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.conversation.delete({
    where: {
      id: params.id,
      userId: session.user.id, // ✅ only allow delete if it belongs to the user
    },
  });

  return NextResponse.json({ message: 'Deleted' });
}
