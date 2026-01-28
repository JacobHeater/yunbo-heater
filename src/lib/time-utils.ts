import { format, parse, isValid } from 'date-fns';

/**
 * Converts 24-hour time format to 12-hour AM/PM format
 */
export function convertTo12Hour(time24: string): string {
  if (!time24) return '';
  // If already in 12-hour format, return as-is
  if (time24.includes('AM') || time24.includes('PM')) return time24;

  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

/**
 * Converts 12-hour AM/PM format to 24-hour format
 */
export function convertTo24Hour(time12: string): string {
  if (!time12) return '';
  // If already in 24-hour format, return as-is
  if (!time12.includes('AM') && !time12.includes('PM')) return time12;

  const [time, ampm] = time12.split(' ');
  const [hours, minutes] = time.split(':');
  let hour24 = parseInt(hours);
  if (ampm === 'PM' && hour24 !== 12) {
    hour24 += 12;
  } else if (ampm === 'AM' && hour24 === 12) {
    hour24 = 0;
  }
  return `${hour24.toString().padStart(2, '0')}:${minutes}`;
}

/**
 * Converts time string to slot index for schedule grid
 * Assumes schedule starts at 9 AM with 30-minute slots
 */
export function timeToSlotIndex(timeString: string): number {
  const parts = timeString.split(':');
  const hours = parseInt(parts[0]);
  const minutes = parseInt(parts[1]);
  const totalMinutes = hours * 60 + minutes;
  const startMinutes = 9 * 60; // 9 AM
  return Math.floor((totalMinutes - startMinutes) / 30);
}

/**
 * Converts duration string to number of 30-minute slots
 */
export function durationToSlots(duration: string): number {
  const parts = duration.split(':');
  const hours = parseInt(parts[0] || '0');
  const minutes = parseInt(parts[1] || '0');
  const totalMinutes = hours * 60 + minutes;
  return Math.ceil(totalMinutes / 30);
}

/**
 * Formats time string for display in 12-hour AM/PM format
 */
export function formatTime(timeString: string): string {
  // If the time already has AM/PM, return it as-is
  if (timeString.toLowerCase().includes('am') || timeString.toLowerCase().includes('pm')) {
    return timeString;
  }

  // Otherwise, format it to 12-hour with AM/PM
  const parts = timeString.split(':');
  const hour = parseInt(parts[0]);
  const minutes = parseInt(parts[1] || '0');
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;

  // Make it more human-readable: omit :00 for whole hours
  if (minutes === 0) {
    return `${displayHour} ${ampm}`;
  } else {
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }
}

/**
 * Formats duration string for human-readable display
 */
export function formatDuration(duration: string): string {
  if (!duration) return '0 minutes';

  // If already human-readable (e.g., "30 minutes" or "1 hour 30 minutes"), return as-is
  const lower = duration.toLowerCase();
  if (lower.includes('hour') || lower.includes('minute')) {
    return duration;
  }

  // Otherwise expect a time-span like HH:MM or HH:MM:SS
  const parts = duration.split(':');
  const hours = parseInt(parts[0] || '0');
  const minutes = parseInt(parts[1] || '0');

  if (hours > 0 && minutes > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} min${minutes !== 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else {
    return '0 minutes';
  }
}

/**
 * Parses a formatted duration string back to HH:MM:SS format
 */
export function parseFormattedDuration(formatted: string): string {
  const hourMinMatch = formatted.match(/(\d+)\s+hour(?:s)?\s+(\d+)\s+min(?:s)?/);
  if (hourMinMatch) {
    const hours = parseInt(hourMinMatch[1]);
    const minutes = parseInt(hourMinMatch[2]);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
  }
  const minMatch = formatted.match(/(\d+)\s+minute(?:s)?/);
  if (minMatch) {
    const minutes = parseInt(minMatch[1]);
    return `00:${minutes.toString().padStart(2, '0')}:00`;
  }
  // Fallback
  return formatted;
}

/**
 * Parses a formatted date string back to YYYY-MM-DD format
 */
export function parseFormattedDate(formatted: string): string {
  if (!formatted) return '';
  try {
    const candidates = ['MMMM d, yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd'];
    for (const fmt of candidates) {
      const date = parse(formatted, fmt, new Date());
      if (isValid(date)) return format(date, 'yyyy-MM-dd');
    }
    return '';
  } catch {
    return '';
  }
}

/**
 * Converts a human-readable time span format to HH:MM:SS format
 */
export function convertReadTimeSpanToWriteFormat(readFormat: string): string {
  const parts = readFormat.split(" ");
  let hours = 0;
  let minutes = 0;

  for (let i = 0; i + 1 < parts.length; i += 2) {
    const value = parseInt(parts[i]);
    const unit = parts[i + 1];

    if (isNaN(value)) break;

    if (unit.startsWith("hour")) {
      hours = value;
    } else if (unit.startsWith("minute")) {
      minutes = value;
    }
  }

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;
}