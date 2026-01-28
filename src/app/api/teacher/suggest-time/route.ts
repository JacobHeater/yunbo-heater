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

    if (!duration) {
      return NextResponse.json({ error: 'Duration is required' }, { status: 400 });
    }

    // Get working hours for all days or specific day
    const workingHoursTable = new WorkingHoursTable();
    const allWorkingHours = await workingHoursTable.readAllAsync();
    
    // Get all enrolled students
    const studentRollTable = new StudentRollTable();
    const students = await studentRollTable.readAllAsync();

    // Parse requested duration
    const [rdh, rdm] = duration.split(':').slice(0, 2).map(Number);
    const requestedMinutes = rdh * 60 + rdm;

    const availableSlots: { [day: string]: string[] } = {};

    // Process each day that has working hours configured
    const configuredDays = allWorkingHours.map(wh => wh.dayOfWeek);
    
    if (configuredDays.length === 0) {
      return NextResponse.json({ error: 'No working hours configured. Please set up your working hours first.' }, { status: 400 });
    }
    
    const daysToProcess = dayOfWeek ? [dayOfWeek] : configuredDays;

    for (const day of daysToProcess) {
      const dayWorkingHours = allWorkingHours.find(wh => wh.dayOfWeek === day);
      
      if (!dayWorkingHours) {
        availableSlots[day] = [];
        continue;
      }

      // Filter students by lesson day
      const dayStudents = students.filter(s => s.lessonDay === day);

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

      // Parse working hours
      const [wh, wm] = dayWorkingHours.startTime.split(':').map(Number);
      const workStart = wh * 60 + wm;
      const [weh, wem] = dayWorkingHours.endTime.split(':').map(Number);
      const workEnd = weh * 60 + wem;

      // Find all available time slots for this day
      const daySlots: string[] = [];
      let currentTime = workStart;

      for (const occ of occupied) {
        // Add all available slots before this occupied time
        while (currentTime + requestedMinutes <= occ.start) {
          const slotHour = Math.floor(currentTime / 60);
          const slotMinute = currentTime % 60;
          const slotTime = `${slotHour.toString().padStart(2, '0')}:${slotMinute.toString().padStart(2, '0')}`;
          daySlots.push(slotTime);
          currentTime += 15; // 15-minute increments for suggestions
        }
        currentTime = Math.max(currentTime, occ.end);
      }

      // Add remaining slots after the last occupied time
      while (currentTime + requestedMinutes <= workEnd) {
        const slotHour = Math.floor(currentTime / 60);
        const slotMinute = currentTime % 60;
        const slotTime = `${slotHour.toString().padStart(2, '0')}:${slotMinute.toString().padStart(2, '0')}`;
        daySlots.push(slotTime);
        currentTime += 15; // 15-minute increments
      }

      availableSlots[day] = daySlots;
    }

    return NextResponse.json({ availableSlots });
  } catch (error) {
    console.error('Error suggesting time:', error);
    return NextResponse.json({ error: 'Failed to suggest time' }, { status: 500 });
  }
}