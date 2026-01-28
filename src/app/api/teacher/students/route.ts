import { NextRequest, NextResponse } from 'next/server';
import { StudentRollTable } from '@/schema/student-roll';
import { WaitingListTable } from '@/schema/waiting-list';
import { SignupsTable } from '@/schema/signups';
import { StudentEntry } from '@/schema/student-entry';
import { StatusCode } from '@/status/status-codes';
import { requireApiAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiAuth(request);
    if (auth instanceof NextResponse) return auth;

    const studentRoll = new StudentRollTable();
    const students = await studentRoll.readAllAsync();
    return NextResponse.json({ students });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiAuth(request);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { id, type, ...studentData } = body;

    if (type === 'manual') {
      const studentRoll = new StudentRollTable();
      // Check if already enrolled
      const existing = await studentRoll.readAllAsync();
      const alreadyEnrolled = existing.some(s => s.emailAddress === studentData.emailAddress);
      if (alreadyEnrolled) {
        return NextResponse.json({ error: 'Student already enrolled' }, { status: 400 });
      }
      await studentRoll.upsertOneAsync(studentData as StudentEntry);
      return NextResponse.json({ success: true });
    } else if (type === 'waiting') {
      const waitingList = new WaitingListTable();
      const studentRoll = new StudentRollTable();
      const student = await waitingList.readOneAsync(id);
      if (student) {
        await studentRoll.upsertOneAsync(student);
        await waitingList.deleteOneAsync(id);
      }
    } else if (type === 'signup') {
      const signups = new SignupsTable();
      const studentRoll = new StudentRollTable();
      const student = await signups.readOneAsync(id);
      if (student) {
        await studentRoll.upsertOneAsync(student);
        await signups.deleteOneAsync(id);
      }
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing student:', error);
    return NextResponse.json({ error: 'Failed to process student' }, { status: 500 });
  }
}