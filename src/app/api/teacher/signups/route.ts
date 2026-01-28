import { NextRequest, NextResponse } from 'next/server';
import { SignupsTable } from '@/schema/signups';
import { requireApiAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiAuth(request);
    if (auth instanceof NextResponse) return auth;

    const signups = new SignupsTable();
    const students = await signups.readAllAsync();
    return NextResponse.json({ students });
  } catch (error) {
    console.error('Error fetching signups:', error);
    return NextResponse.json({ error: 'Failed to fetch signups' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireApiAuth(request);
    if (auth instanceof NextResponse) return auth;

    const { id } = await request.json();
    const signups = new SignupsTable();
    await signups.deleteOneAsync(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting from signups:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}