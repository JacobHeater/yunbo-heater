import { NextRequest, NextResponse } from 'next/server';
import { GoogleSheets } from '@/lib/google-sheets';
import { getSession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const sheets = new GoogleSheets();
    const students = await sheets.getStudents();
    const student = students.find(s => s.id === id);

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ student });
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json({ error: 'Failed to fetch student' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { notes } = await request.json();

    const sheets = new GoogleSheets();
    const students = await sheets.getStudents();
    const studentIndex = students.findIndex(s => s.id === id);

    if (studentIndex === -1) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Update the student's notes
    const updatedStudent = { ...students[studentIndex], notes: notes || '' };

    // Update the student in Google Sheets
    await sheets.updateStudent(id, { notes: notes || '' });

    return NextResponse.json({ success: true, student: updatedStudent });
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
  }
}