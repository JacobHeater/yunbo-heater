'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StudentEntryRow } from '@/schema/student-entry';
import Button from '@/components/Button';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface LessonSlot {
    student: StudentEntryRow;
    startSlot: number;
    durationSlots: number;
}

export default function SchedulePage() {
    const [students, setStudents] = useState<StudentEntryRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Generate time slots from 9 AM to 6 PM in 30-minute increments
    const TIME_SLOTS = [];
    for (let hour = 9; hour <= 18; hour++) {
        TIME_SLOTS.push(`${hour.toString().padStart(2, '0')}:00`);
        if (hour < 18) {
            TIME_SLOTS.push(`${hour.toString().padStart(2, '0')}:30`);
        }
    }

    // Helper function to convert time string to slot index
    const timeToSlotIndex = (timeString: string): number => {
        const parts = timeString.split(':');
        const hours = parseInt(parts[0]);
        const minutes = parseInt(parts[1]);
        const totalMinutes = hours * 60 + minutes;
        const startMinutes = 9 * 60; // 9 AM
        return Math.floor((totalMinutes - startMinutes) / 30);
    };

    // Helper function to validate if time is between 9 AM and 6 PM
    const isValidLessonTime = (timeString: string): boolean => {
        let hours: number;
        let minutes: number;

        if (timeString.toLowerCase().includes('am') || timeString.toLowerCase().includes('pm')) {
            // Handle 12-hour format with AM/PM
            const parts = timeString.split(':');
            hours = parseInt(parts[0]);
            minutes = parseInt(parts[1]?.split(' ')[0] || '0');

            const ampm = timeString.toLowerCase().includes('pm') ? 'pm' : 'am';

            // Convert to 24-hour format
            if (ampm === 'pm' && hours !== 12) {
                hours += 12;
            } else if (ampm === 'am' && hours === 12) {
                hours = 0;
            }
        } else {
            // Handle 24-hour format
            const parts = timeString.split(':');
            hours = parseInt(parts[0]);
            minutes = parseInt(parts[1] || '0');
        }

        // Convert to total minutes for comparison
        const totalMinutes = hours * 60 + minutes;
        const nineAM = 9 * 60; // 9:00 AM
        const sixPM = 18 * 60; // 6:00 PM

        return totalMinutes >= nineAM && totalMinutes <= sixPM;
    };

    // Helper function to convert duration to number of slots
    const durationToSlots = (duration: string): number => {
        const parts = duration.split(':');
        const hours = parseInt(parts[0] || '0');
        const minutes = parseInt(parts[1] || '0');
        const totalMinutes = hours * 60 + minutes;
        return Math.ceil(totalMinutes / 30);
    };

    // Helper function to format time for display
    const formatTime = (timeString: string): string => {
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
    };

    // Helper function to format duration for display
    const formatDuration = (duration: string): string => {
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
    };

    const fetchStudents = async () => {
        try {
            const res = await fetch('/api/teacher/students');
            if (res.ok) {
                const data = await res.json();
                setStudents(data.students || []);
            } else {
                setError('Failed to load students');
            }
        } catch (err) {
            setError('An error occurred');
        }
    };

    useEffect(() => {
        const checkSessionAndFetch = async () => {
            try {
                // Check session
                const sessionRes = await fetch('/api/teacher/session');
                if (!sessionRes.ok) {
                    router.push('/teacher/login');
                    return;
                }

                await fetchStudents();
            } catch (err) {
                setError('An error occurred');
            } finally {
                setLoading(false);
            }
        };

        checkSessionAndFetch();
    }, [router]);

    // Group students by day and create lesson slots
    const lessonsByDay = DAYS_OF_WEEK.reduce((acc, day) => {
        const dayStudents = students.filter(student => student.lessonDay === day);
        const lessonSlots: LessonSlot[] = dayStudents.map(student => ({
            student,
            startSlot: timeToSlotIndex(student.lessonTime),
            durationSlots: durationToSlots(student.duration)
        })).sort((a, b) => a.startSlot - b.startSlot);

        acc[day] = lessonSlots;
        return acc;
    }, {} as Record<string, LessonSlot[]>);

    // Get current day of the week
    const currentDayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-5rem)] bg-background py-16">
                <div className="container">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center">Loading schedule...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[calc(100vh-5rem)] bg-background py-16">
                <div className="container">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center text-red-600">{error}</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-5rem)] bg-background py-16">
            <div className="container">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8 text-right">
                        <Button variant="primary" size="sm" onClick={() => router.push('/teacher/dashboard')} className="py-2">
                            Back to Dashboard
                        </Button>
                    </div>
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-semibold text-foreground">Weekly Schedule</h1>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {DAYS_OF_WEEK.map(day => {
                            const isCurrentDay = day === currentDayOfWeek;
                            const cardClasses = `bg-white rounded-xl shadow-lg border overflow-hidden transition-all duration-300 ${isCurrentDay
                                ? 'border-amber-400 shadow-amber-200 ring-2 ring-amber-200'
                                : 'border-slate-200/50'
                                }`;
                            const headerClasses = `p-4 text-white ${isCurrentDay
                                ? 'bg-gradient-to-r from-amber-500 to-orange-600'
                                : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                                }`;

                            return (
                                <div key={day} className={cardClasses}>
                                    {/* Day header */}
                                    <div className={headerClasses}>
                                        <h3 className="text-lg font-bold flex items-center gap-2">
                                            {day}
                                            {isCurrentDay && (
                                                <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-medium">
                                                    Today
                                                </span>
                                            )}
                                        </h3>
                                        <p className={`text-sm ${isCurrentDay ? 'text-amber-100' : 'text-indigo-100'}`}>
                                            {lessonsByDay[day]?.length || 0} lesson{lessonsByDay[day]?.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>

                                    {/* Lessons list */}
                                    <div className="p-4 space-y-3">
                                        {lessonsByDay[day]?.length > 0 ? (
                                            lessonsByDay[day].map(lesson => (
                                                <div
                                                    key={lesson.student.id}
                                                    className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-slate-200/30 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                                            {lesson.student.studentName}
                                                        </div>
                                                        <div className="text-xs font-mono text-slate-500 bg-white px-2 py-1 rounded">
                                                            {formatTime(lesson.student.lessonTime)}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1 text-sm text-slate-600">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                                                            {lesson.student.skillLevel}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                                                            Age {lesson.student.age}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                                                            {formatDuration(lesson.student.duration)}
                                                        </div>
                                                    </div>

                                                    {lesson.student.notes && (
                                                        <div className="mt-2 p-2 bg-white/50 rounded text-xs text-slate-500 italic">
                                                            {lesson.student.notes}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-slate-400">
                                                <div className="text-4xl mb-2">🎵</div>
                                                <p>No lessons scheduled</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
