import type { WorkingHours } from '../schema/working-hours';

interface WorkingHoursDisplayProps {
  workingHours: WorkingHours[];
  loading?: boolean;
}

function formatTime(time24: string): string {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  let hour12 = parseInt(hours);
  const ampm = hour12 >= 12 ? 'PM' : 'AM';
  if (hour12 > 12) hour12 -= 12;
  if (hour12 === 0) hour12 = 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export default function WorkingHoursDisplay({ workingHours, loading = false }: WorkingHoursDisplayProps) {
  if (!loading && (!workingHours || workingHours.length === 0)) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
      <h3 className="text-xl font-semibold text-foreground mb-4 text-center">Available Lesson Times</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          // Minimal placeholders — show four simple skeleton cells
          [0, 1, 2, 3].map(i => (
            <div key={i} className="text-center">
              <div className="h-5 w-16 mx-auto bg-foreground/10 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-24 mx-auto bg-foreground/10 rounded animate-pulse"></div>
            </div>
          ))
        ) : (
          workingHours.map((wh) => (
            <div key={wh.id} className="text-center">
              <div className="font-semibold text-blue-600">{wh.dayOfWeek}</div>
              <div className="text-sm text-foreground/70">{formatTime(wh.startTime)} — {formatTime(wh.endTime)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}