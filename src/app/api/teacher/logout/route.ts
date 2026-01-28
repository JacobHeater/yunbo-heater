import { NextRequest, NextResponse } from 'next/server';
import { destroySession, requireApiAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiAuth(request);
    if (auth instanceof NextResponse) return auth;
    // Destroy the session
    await destroySession();

    // Create response that clears the session cookie
    const response = NextResponse.json({
      message: 'Logout successful'
    });

    // Clear the session cookie
    response.cookies.set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0 // Expire immediately
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}