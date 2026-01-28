import { NextRequest, NextResponse } from 'next/server';
import { StudentRollTable } from '@/schema/student-roll';
import { requireApiAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireApiAuth(request);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const studentRoll = new StudentRollTable();
    const student = await studentRoll.readOneAsync(id);

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
    const auth = await requireApiAuth(request);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const updateData = await request.json();
    console.log('API PUT request for student ID:', id);
    console.log('Update data received:', updateData);

    const studentRoll = new StudentRollTable();
    const existingStudent = await studentRoll.readOneAsync(id);

    if (!existingStudent) {
      console.log('Student not found with ID:', id);
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    console.log('Current student data:', existingStudent);

    // Update the student with all provided fields
    const updatedStudent = { ...existingStudent, ...updateData };
    console.log('Updated student data:', updatedStudent);

    // Update the student in Google Sheets
    await studentRoll.upsertOneAsync(updatedStudent);
    console.log('Google Sheets update result: success');

    return NextResponse.json({ success: true, student: updatedStudent });
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireApiAuth(request);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const studentRoll = new StudentRollTable();
    const existing = await studentRoll.readOneAsync(id);
    if (!existing) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    await studentRoll.deleteOneAsync(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}