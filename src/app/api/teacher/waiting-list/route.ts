import { NextRequest, NextResponse } from 'next/server';
import { WaitingListTable } from '@/schema/waiting-list';
import { requireApiAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiAuth(request);
    if (auth instanceof NextResponse) return auth;

    const waitingList = new WaitingListTable();
    const students = await waitingList.readAllAsync();
    return NextResponse.json({ students });
  } catch (error) {
    console.error('Error fetching waiting list:', error);
    return NextResponse.json({ error: 'Failed to fetch waiting list' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireApiAuth(request);
    if (auth instanceof NextResponse) return auth;

    const { id } = await request.json();
    const waitingList = new WaitingListTable();
    await waitingList.deleteOneAsync(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting from waiting list:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}