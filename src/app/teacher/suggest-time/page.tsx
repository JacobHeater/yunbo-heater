"use client";

import { useState, useEffect } from 'react';
import Button from '@/components/Button';
import { useToast } from '@/components/ToastContext';
import { useRouter } from 'next/navigation';
import type { WorkingHours } from '@/schema/working-hours';
import { convertTo12Hour } from '@/lib/time-utils';

const DURATION_OPTIONS = [
    { value: '00:30:00', label: '30 minutes' },
    { value: '00:45:00', label: '45 minutes' },
    { value: '01:00:00', label: '60 minutes' },
];

export default function SuggestTime() {
    const [session, setSession] = useState<{ email: string; role: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
    const [form, setForm] = useState({ dayOfWeek: '', duration: '00:30:00' });
    const [availableSlots, setAvailableSlots] = useState<{ [day: string]: string[] }>({});
    const [suggesting, setSuggesting] = useState(false);
    const { showToast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch('/api/teacher/session');
                if (res.ok) {
                    const data = await res.json();
                    setSession(data.user);
                } else {
                    router.push('/teacher/login');
                }
            } catch {
                router.push('/teacher/login');
            } finally {
                setLoading(false);
            }
        };
        checkSession();
    }, [router]);

    useEffect(() => {
        if (!session) return;
        const fetchWorkingHours = async () => {
            try {
                const res = await fetch('/api/teacher/working-hours');
                if (res.ok) {
                    const data = await res.json();
                    setWorkingHours(data.workingHours || []);
                }
            } catch (error) {
                console.error('Error fetching working hours:', error);
            }
        };
        fetchWorkingHours();
    }, [session]);

    useEffect(() => {
        if (workingHours.length > 0 && !form.dayOfWeek) {
            // Don't auto-select a day if user hasn't chosen one yet
            return;
        }
    }, [workingHours, form.dayOfWeek]);

    const handleSuggest = async () => {
        setSuggesting(true);
        setAvailableSlots({});
        try {
            const res = await fetch('/api/teacher/suggest-time', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok) {
                // Convert all slots to 12-hour format
                const formattedSlots: { [day: string]: string[] } = {};
                Object.entries(data.availableSlots).forEach(([day, slots]) => {
                    formattedSlots[day] = (slots as string[]).map(slot => convertTo12Hour(slot));
                });
                setAvailableSlots(formattedSlots);
                
                const totalSlots = Object.values(formattedSlots).reduce((sum, slots) => sum + slots.length, 0);
                showToast(`Found ${totalSlots} available time slots across all days!`, 'success');
            } else {
                showToast(data.error || 'Failed to find available times', 'error');
            }
        } catch (error) {
            console.error('Error suggesting time:', error);
            showToast('Failed to find available times', 'error');
        } finally {
            setSuggesting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-5rem)] bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
                    <p className="text-foreground/70">Loading...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className="min-h-[calc(100vh-5rem)] bg-background py-16">
            <div className="container">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-6 text-right">
                        <Button
                            onClick={() => router.push('/teacher/dashboard')}
                            variant="primary"
                            size="sm"
                        >
                            Return to Dashboard
                        </Button>
                    </div>

                    <h1 className="text-3xl font-semibold text-foreground mb-8">Suggest Lesson Time</h1>

                    <div className="bg-white rounded-lg shadow p-6">
                        {workingHours.length === 0 ? (
                            <p className="text-foreground/70">No working hours configured. Please set up your working hours first.</p>
                        ) : (
                            <>
                                <p className="text-foreground/70 mb-6">
                                    Select a specific day or "Any Day" to see available time slots that fit within your working hours and avoid conflicts with existing students.
                                </p>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Preferred Day</label>
                                        <select
                                            value={form.dayOfWeek}
                                            onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Any Day</option>
                                            {workingHours.map(wh => (
                                                <option key={wh.dayOfWeek} value={wh.dayOfWeek}>{wh.dayOfWeek}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Lesson Duration</label>
                                        <select
                                            value={form.duration}
                                            onChange={(e) => setForm({ ...form, duration: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {DURATION_OPTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                                        </select>
                                    </div>

                                    <Button
                                        onClick={handleSuggest}
                                        disabled={suggesting}
                                        variant="primary"
                                        size="md"
                                        className="w-full"
                                    >
                                        {suggesting ? 'Finding Available Times...' : 'Show Available Times'}
                                    </Button>
                                </div>

                                {Object.keys(availableSlots).length > 0 && (
                                    <div className="mt-6 space-y-4">
                                        {Object.entries(availableSlots).map(([day, slots]) => (
                                            <div key={day} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                                <h3 className="text-lg font-medium text-green-800 mb-3">{day}</h3>
                                                {slots.length > 0 ? (
                                                    <>
                                                        <p className="text-green-700 text-sm mb-4">
                                                            {slots.length} available {DURATION_OPTIONS.find(d => d.value === form.duration)?.label} time slots:
                                                        </p>
                                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                                            {slots.map((slot, index) => (
                                                                <div key={index} className="bg-white border border-green-300 rounded-md px-3 py-2 text-center text-green-800 font-medium">
                                                                    {slot}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <p className="text-gray-600 text-sm">No available time slots for this day.</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}