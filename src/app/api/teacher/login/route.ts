import { NextRequest, NextResponse } from 'next/server';
import { AdminTable } from '@/schema/admin';
import { createSession, clearUserSessions } from '@/lib/auth';

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
      const adminTable = new AdminTable();
      const admins = await adminTable.readAllAsync();
      adminCount = admins.length;
      console.log('Found admins:', adminCount, admins.map(a => ({ email: a.emailAddress, hasPassword: !!a.password })));

      // Check if credentials match any admin account
      admin = admins.find(admin => admin.emailAddress === email && admin.password === password);
    } catch (error) {
      console.log('Google Sheets error, falling back to test credentials:', String(error));
      // Fallback for local/dev: accept a single test account
      if (email === 'jacobheater@gmail.com' && password === 'test') {
        admin = { id: 'local-test', emailAddress: email, password };
      }
    }

    console.log('Login attempt:', { email, found: !!admin });

    console.log('Login attempt:', { email, found: !!admin });

    if (admin) {
      // Clear all existing sessions for this user
      clearUserSessions(admin.emailAddress);

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