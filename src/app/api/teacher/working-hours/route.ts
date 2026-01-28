import { NextRequest, NextResponse } from 'next/server';
import { WorkingHoursTable, WorkingHours } from '@/schema/working-hours';
import { requireApiAuth } from '@/lib/auth';

export async function GET() {
  try {
    const table = new WorkingHoursTable();
    const rows = await table.readAllAsync();
    return NextResponse.json({ workingHours: rows });
  } catch (error) {
    console.error('Error fetching working hours:', error);
    return NextResponse.json({ error: 'Failed to fetch working hours' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiAuth(request);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { id, dayOfWeek, startTime, endTime } = body as Partial<WorkingHours>;
    if (!dayOfWeek || !startTime || !endTime) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const table = new WorkingHoursTable();
    const entry: WorkingHours = {
      id: id || undefined as unknown as string,
      dayOfWeek: String(dayOfWeek),
      startTime: String(startTime),
      endTime: String(endTime),
    } as WorkingHours;

    await table.upsertOneAsync(entry);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating working hours:', error);
    return NextResponse.json({ error: 'Failed to create working hours' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireApiAuth(request);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { id, dayOfWeek, startTime, endTime } = body as Partial<WorkingHours>;
    if (!id || !dayOfWeek || !startTime || !endTime) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const table = new WorkingHoursTable();
    const entry: WorkingHours = { id, dayOfWeek: String(dayOfWeek), startTime: String(startTime), endTime: String(endTime) } as WorkingHours;
    await table.upsertOneAsync(entry);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating working hours:', error);
    return NextResponse.json({ error: 'Failed to update working hours' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireApiAuth(request);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { id } = body as { id?: string };
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const table = new WorkingHoursTable();
    await table.deleteOneAsync(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting working hours:', error);
    return NextResponse.json({ error: 'Failed to delete working hours' }, { status: 500 });
  }
}
