import { NextRequest, NextResponse } from 'next/server';
import { GoogleSheets } from '@/lib/google-sheets';
import { createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    console.log('Login request received:', { email, hasPassword: !!password });

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Authenticate against Google Sheets admin data
    let admin;
    let adminCount = 0;
    try {
      const googleSheets = new GoogleSheets();
      const admins = await googleSheets.getAdmin();
      adminCount = admins.length;
      console.log('Found admins:', adminCount, admins.map(a => ({ email: a.emailAddress, hasPassword: !!a.password })));

      // Check if credentials match any admin account
      admin = admins.find(admin => admin.emailAddress === email && admin.password === password);
    } catch (error) {
      console.log('Google Sheets error, falling back to test credentials:', (error as any).message);
    }

    console.log('Login attempt:', { email, found: !!admin });

    if (admin) {
      // Create session
      const sessionId = createSession(admin.emailAddress, 'teacher');

      // Create response with session cookie
      const response = NextResponse.json({
        message: 'Login successful',
        user: {
          email: admin.emailAddress,
          role: 'teacher'
        }
      });

      // Set HTTP-only cookie
      response.cookies.set('session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 // 24 hours
      });

      return response;
    } else {
      return NextResponse.json(
        {
          message: 'Invalid email or password',
          debug: {
            adminCount: adminCount,
            attemptedEmail: email
          }
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}