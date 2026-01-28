import { format, parse, parseISO } from 'date-fns';
import { convertReadTimeSpanToWriteFormat } from '../schema/formatting';
import { formatDuration, formatTime, convertTo24Hour } from './time-utils';

export const calculateLessonCost = (minutelyRate: string, duration: string): string => {
  const rate = parseFloat(minutelyRate.replace(/[$,]/g, ''));

  let hours = 0;
  let minutes = 0;

  if (duration.includes(':')) {
    // Already in HH:mm:ss format
    const parts = duration.split(':');
    hours = parseInt(parts[0] || '0');
    minutes = parseInt(parts[1] || '0');
  } else {
    // Formatted string like "30 minutes"
    const empiricalDuration = convertReadTimeSpanToWriteFormat(duration);
    const parts = empiricalDuration.split(':');
    hours = parseInt(parts[0] || '0');
    minutes = parseInt(parts[1] || '0');
  }

  const totalMinutes = hours * 60 + minutes;
  const cost = rate * totalMinutes;
  return Math.round(cost).toFixed(2);
};

export const formatValue = (value: string, column: { dataType: string; readFormat?: boolean }): string => {
  if (!column.readFormat) return value;

  switch (column.dataType) {
    case 'TimeSpan':
      return formatDuration(value);
    case 'currency':
      return `$${parseFloat(value).toFixed(2)}`;
    case 'Date':
      let date: Date;
      if (typeof value === 'string') {
        if (value.includes('/')) {
          // Assume MM/dd/yyyy (local)
          date = parse(value, 'MM/dd/yyyy', new Date());
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          // Date-only string like yyyy-MM-dd -> parse as local date (avoid UTC shift)
          date = parse(value, 'yyyy-MM-dd', new Date());
        } else {
          // Full ISO (with time or timezone) -> preserve with parseISO
          date = parseISO(value);
        }
      } else if (typeof value === 'number') {
        // Assume serial date (days since 1899-12-30) - parse as local date to avoid UTC anchor
        const baseDate = parse('1899-12-30', 'yyyy-MM-dd', new Date());
        date = new Date(baseDate.getTime() + value * 24 * 60 * 60 * 1000);
      } else {
        date = new Date(value);
      }
      return format(date, 'MMMM d, yyyy');
    case 'Time':
      return formatTime(value);
    default:
      return value;
  }
};

export const writeFormatValue = (value: string, column: { dataType: string; writeFormat?: boolean }): string => {
  if (!column.writeFormat) return value;

  switch (column.dataType) {
    case 'Time':
      return convertTo24Hour(value);
    case 'Date':
      let date: Date;
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        // yyyy-MM-dd -> parse as local date to avoid UTC conversion
        date = parse(value, 'yyyy-MM-dd', new Date());
      } else {
        date = parseISO(value);
      }
      return format(date, 'MM/dd/yyyy');
    case 'currency':
      return parseFloat(value.replace(/[$,]/g, '')).toFixed(2);
    case 'TimeSpan':
      // Check if it's already in HH:MM:SS format
      if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(value)) {
        const parts = value.split(':');
        return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:${parts[2] || '00'}`;
      }
      // Parse formatted duration like "30 minutes" or "1 hour 30 minutes"
      const durationMatch = value.match(/(\d+)\s+hour(?:s)?(?:\s+(\d+)\s+min(?:s)?)?|(\d+)\s+minute(?:s)?/);
      let hours = 0, minutes = 0;
      if (durationMatch) {
        if (durationMatch[1]) { // hours and possibly minutes
          hours = parseInt(durationMatch[1]);
          minutes = durationMatch[2] ? parseInt(durationMatch[2]) : 0;
        } else if (durationMatch[3]) { // only minutes
          minutes = parseInt(durationMatch[3]);
        }
      }
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
    default:
      return value;
  }
};

export function calculateLessonPricing(ratePerMinute: string | number, lengths: number[]): { length: number; cost: string }[] {
  const rate = typeof ratePerMinute === 'string' ? parseFloat(ratePerMinute.replace(/[$,]/g, '')) : ratePerMinute;
  return lengths.map(length => ({
    length,
    cost: (Math.round(rate * length)).toFixed(2)
  }));
}