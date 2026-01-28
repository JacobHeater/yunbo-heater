'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StudentEntry } from '@/schema/student-entry';
import Button from '@/components/Button';
import { timeToSlotIndex, durationToSlots, formatTime, formatDuration, parseFormattedDuration, convertTo24Hour } from '@/lib/time-utils';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface LessonSlot {
    student: StudentEntry;
    startSlot: number;
    durationSlots: number;
}

export default function SchedulePage() {
    const [students, setStudents] = useState<StudentEntry[]>([]);
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

    const fetchStudents = async () => {
        try {
            const res = await fetch('/api/teacher/students');
            if (res.ok) {
                const data = await res.json();
                setStudents(data.students || []);
            } else {
                setError('Failed to load students');
            }
        } catch {
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
            } catch {
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
            startSlot: timeToSlotIndex(convertTo24Hour(student.lessonTime)),
            durationSlots: durationToSlots(parseFormattedDuration(student.duration))
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
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
                                                        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-slate-200/30 shadow-sm hover:shadow-md transition-all duration-200 group"
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

                                                    {/* Notes intentionally not shown on schedule cards */}
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
