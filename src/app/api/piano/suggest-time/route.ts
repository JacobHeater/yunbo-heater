import { NextRequest, NextResponse } from 'next/server';
import { WorkingHoursTable } from '@/schema/working-hours';
import { convertTo12Hour } from '@/lib/time-utils';
import { SuggestionType, Suggestion } from '@/models/suggestion';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const duration = searchParams.get('duration');
    const suggest = (searchParams.get('suggest') as SuggestionType) || SuggestionType.BOTH;
    const dayOfWeek = searchParams.get('dayOfWeek');

    if (!duration) {
      return NextResponse.json({ error: 'Duration required' }, { status: 400 });
    }

    // Parse duration to minutes
    const [dh, dm] = duration.split(':').slice(0, 2).map(Number);
    const durationMinutes = dh * 60 + dm;

    // Get working hours
    const workingHoursTable = new WorkingHoursTable();
    const allWorkingHours = await workingHoursTable.readAllAsync();

    if (allWorkingHours.length === 0) {
      return NextResponse.json({ error: 'No working hours configured' }, { status: 400 });
    }

    if (suggest === SuggestionType.DAY) {
      // Suggest days that have working hours
      const suggestions: Suggestion[] = allWorkingHours.map(wh => ({ day: wh.dayOfWeek }));
      return NextResponse.json({ suggestions });
    } else if (suggest === SuggestionType.TIME) {
      if (!dayOfWeek) {
        return NextResponse.json({ error: 'Day of week required for time suggestion' }, { status: 400 });
      }
      // Find time for the specific day
      const dayHours = allWorkingHours.find(wh => wh.dayOfWeek === dayOfWeek);
      if (!dayHours) {
        return NextResponse.json({ error: 'No working hours for this day' }, { status: 400 });
      }

      // Calculate available time range
      const [sh, sm] = dayHours.startTime.split(':').map(Number);
      const [eh, em] = dayHours.endTime.split(':').map(Number);
      const startMinutes = sh * 60 + sm;
      const endMinutes = eh * 60 + em;
      const availableMinutes = endMinutes - startMinutes;

      if (availableMinutes < durationMinutes) {
        return NextResponse.json({ error: 'Duration does not fit in working hours' }, { status: 400 });
      }

      // Generate time suggestions that align with quarter-hour boundaries
      const suggestions: Suggestion[] = [];

      // Find the next quarter-hour boundary after start time
      const startQuarter = Math.ceil(startMinutes / 15) * 15;

      // Generate suggestions at quarter-hour intervals
      for (let minutes = startQuarter; minutes + durationMinutes <= endMinutes; minutes += 15) {
        if (suggestions.length >= 5) break;

        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
        suggestions.push({ time: convertTo12Hour(timeString) });
      }

      // If we don't have at least 3 suggestions, try half-hour intervals
      if (suggestions.length < 3) {
        suggestions.length = 0; // Clear existing suggestions
        const startHalf = Math.ceil(startMinutes / 30) * 30;

        for (let minutes = startHalf; minutes + durationMinutes <= endMinutes; minutes += 30) {
          if (suggestions.length >= 5) break;

          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
          suggestions.push({ time: convertTo12Hour(timeString) });
        }
      }

      // If still no suggestions, use the working hours start time as fallback
      if (suggestions.length === 0) {
        suggestions.push({ time: convertTo12Hour(dayHours.startTime) });
      }

      return NextResponse.json({ suggestions });
    } else {
      // Both - existing logic
      // Sort by earliest start time
      const sortedHours = allWorkingHours.sort((a, b) => a.startTime.localeCompare(b.startTime));

      // Find up to 5 days where the duration fits
      const suggestions: Suggestion[] = [];
      for (const wh of sortedHours) {
        const [sh, sm] = wh.startTime.split(':').map(Number);
        const [eh, em] = wh.endTime.split(':').map(Number);
        const startMinutes = sh * 60 + sm;
        const endMinutes = eh * 60 + em;

        if (startMinutes + durationMinutes <= endMinutes) {
          suggestions.push({
            day: wh.dayOfWeek,
            time: convertTo12Hour(wh.startTime)
          });
          if (suggestions.length >= 5) break;
        }
      }

      // If less than 3, add more even if they don't perfectly fit
      if (suggestions.length < 3) {
        for (const wh of sortedHours) {
          if (!suggestions.some(s => s.day === wh.dayOfWeek)) {
            suggestions.push({
              day: wh.dayOfWeek,
              time: convertTo12Hour(wh.startTime)
            });
            if (suggestions.length >= 3) break;
          }
        }
      }

      return NextResponse.json({ suggestions });
    }

  } catch (error) {
    console.error('Error suggesting time:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}