// src/app/api/admin/create-user/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    // Check if user making the request is admin
    const userId = req.cookies.get('userId')?.value;
    if (userId !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get userId and password for new user from request body
    const { userId: newUserId, password }: { userId: string; password: string } = await req.json();

    if (!newUserId || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { userId: newUserId },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        userId: newUserId,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Create-user API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
