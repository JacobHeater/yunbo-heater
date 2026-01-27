import { NextRequest, NextResponse } from 'next/server';
import { GoogleSheets } from '@/lib/google-sheets';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sheets = new GoogleSheets();
    const students = await sheets.getSignups();
    return NextResponse.json({ students });
  } catch (error) {
    console.error('Error fetching signups:', error);
    return NextResponse.json({ error: 'Failed to fetch signups' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();
    const sheets = new GoogleSheets();
    await sheets.deleteFromSignups(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting from signups:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}