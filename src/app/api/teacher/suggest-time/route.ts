import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth';
import { WorkingHoursTable } from '@/schema/working-hours';
import { StudentRollTable } from '@/schema/student-roll';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiAuth(request);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { dayOfWeek, duration } = body;

    if (!dayOfWeek || !duration) {
      return NextResponse.json({ error: 'Missing dayOfWeek or duration' }, { status: 400 });
    }

    // Get working hours for the day
    const workingHoursTable = new WorkingHoursTable();
    const allWorkingHours = await workingHoursTable.readAllAsync();
    const dayWorkingHours = allWorkingHours.find(wh => wh.dayOfWeek === dayOfWeek);

    if (!dayWorkingHours) {
      return NextResponse.json({ error: 'No working hours set for this day' }, { status: 400 });
    }

    // Get all enrolled students
    const studentRollTable = new StudentRollTable();
    const students = await studentRollTable.readAllAsync();

    // Filter students by lesson day
    const dayStudents = students.filter(s => s.lessonDay === dayOfWeek);

    // Collect occupied intervals: array of { start: minutes, end: minutes }
    const occupied: { start: number, end: number }[] = [];

    for (const student of dayStudents) {
      const startTime = student.lessonTime; // HH:MM
      const dur = student.duration; // HH:MM:SS

      // Parse start time to minutes since midnight
      const [sh, sm] = startTime.split(':').map(Number);
      const startMinutes = sh * 60 + sm;

      // Parse duration to minutes
      const [dh, dm] = dur.split(':').slice(0, 2).map(Number);
      const durationMinutes = dh * 60 + dm;

      occupied.push({ start: startMinutes, end: startMinutes + durationMinutes });
    }

    // Sort occupied by start time
    occupied.sort((a, b) => a.start - b.start);

    // Parse requested duration
    const [rdh, rdm] = duration.split(':').slice(0, 2).map(Number);
    const requestedMinutes = rdh * 60 + rdm;

    // Parse working hours
    const [wh, wm] = dayWorkingHours.startTime.split(':').map(Number);
    const workStart = wh * 60 + wm;
    const [weh, wem] = dayWorkingHours.endTime.split(':').map(Number);
    const workEnd = weh * 60 + wem;

    // Find the first available slot
    let currentTime = workStart;

    for (const occ of occupied) {
      if (currentTime + requestedMinutes <= occ.start) {
        // Found a gap
        break;
      }
      currentTime = Math.max(currentTime, occ.end);
    }

    if (currentTime + requestedMinutes > workEnd) {
      return NextResponse.json({ error: 'No available time slot for the requested duration on this day' }, { status: 400 });
    }

    // Convert back to HH:MM
    const suggestedHour = Math.floor(currentTime / 60);
    const suggestedMinute = currentTime % 60;
    const suggestedTime = `${suggestedHour.toString().padStart(2, '0')}:${suggestedMinute.toString().padStart(2, '0')}`;

    return NextResponse.json({ suggestedTime });
  } catch (error) {
    console.error('Error suggesting time:', error);
    return NextResponse.json({ error: 'Failed to suggest time' }, { status: 500 });
  }
}