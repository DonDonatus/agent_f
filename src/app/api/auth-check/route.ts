// src/app/api/auth-check/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function GET(req: NextRequest) {
  const headers = { 'Cache-Control': 'no-store, max-age=0' };

  // 1. Legacy cookie-based auth
  if (req.cookies.get('auth')?.value === 'true') {
    return NextResponse.json({ success: true }, { status: 200, headers });
  }

  // 2. NextAuth session fallback
  const session = await getServerSession(authOptions);
  if (session) {
    return NextResponse.json({ success: true }, { status: 200, headers });
  }

  // 3. Neither present → unauthorized
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401, headers }
  );
}
