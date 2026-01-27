import { NextRequest, NextResponse } from 'next/server';
import { GoogleSheets } from '@/lib/google-sheets';
import { StudentEntryRow } from '@/schema/student-entry';
import { StatusCode } from '@/status/status-codes';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sheets = new GoogleSheets();
    const students = await sheets.getStudents();
    return NextResponse.json({ students });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, type, ...studentData } = body;
    const sheets = new GoogleSheets();

    if (type === 'manual') {
      const status = await sheets.addStudentManually(studentData as StudentEntryRow);
      if (status !== StatusCode.Success) {
        return NextResponse.json({ error: 'Failed to add student manually' }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    } else if (type === 'waiting') {
      await sheets.promoteFromWaitingList(id);
    } else if (type === 'signup') {
      await sheets.promoteFromSignups(id);
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing student:', error);
    return NextResponse.json({ error: 'Failed to process student' }, { status: 500 });
  }
}