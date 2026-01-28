import { NextRequest, NextResponse } from 'next/server';
import { WaitingListTable } from '@/schema/waiting-list';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emailAddress } = body;

    if (!emailAddress || typeof emailAddress !== 'string') {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }

    const waitingListTable = new WaitingListTable();
    const waitingList = await waitingListTable.readAllAsync();

    // Find the position of this email in the waiting list
    // Assuming the list is ordered by signup date (createdAt or id)
    const position = waitingList.findIndex(entry =>
      entry.emailAddress.toLowerCase() === emailAddress.toLowerCase()
    );

    if (position === -1) {
      return NextResponse.json({
        error: 'Email address not found on waiting list'
      }, { status: 404 });
    }

    // Position is 0-indexed, but we want to show 1-indexed position
    const displayPosition = position + 1;
    const totalWaiters = waitingList.length;

    return NextResponse.json({
      position: displayPosition,
      total: totalWaiters
    });
  } catch (error) {
    console.error('Error checking waiting list position:', error);
    return NextResponse.json({ error: 'Failed to check waiting list position' }, { status: 500 });
  }
}