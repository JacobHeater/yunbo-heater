"use client";

import { useEffect, useState } from 'react';
import type { WorkingHours } from '@/schema/working-hours';
import { useRouter } from 'next/navigation';
import { FaChevronRight } from 'react-icons/fa';
import { eventBus } from '@/lib/event-bus';
import Button from '@/components/Button';
import { convertTo12Hour } from '@/lib/time-utils';

export default function TeacherDashboard() {
  const [session, setSession] = useState<{ email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);

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
    let mounted = true;

    const dayOrder = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

    const normalizeDay = (s?: string) => {
      if (!s) return s || '';
      const low = s.toLowerCase();
      if (low.startsWith('mon')) return 'Monday';
      if (low.startsWith('tue')) return 'Tuesday';
      if (low.startsWith('wed')) return 'Wednesday';
      if (low.startsWith('thu')) return 'Thursday';
      if (low.startsWith('fri')) return 'Friday';
      if (low.startsWith('sat')) return 'Saturday';
      if (low.startsWith('sun')) return 'Sunday';
      return s.charAt(0).toUpperCase() + s.slice(1);
    };

    const fetchHours = async () => {
      try {
        const res = await fetch('/api/teacher/working-hours');
        if (!res.ok) return;
        const data = await res.json();
        const hours: WorkingHours[] = data.workingHours || [];
        const sorted = hours.slice().sort((a, b) => {
          const aDay = dayOrder.indexOf(normalizeDay(a.dayOfWeek));
          const bDay = dayOrder.indexOf(normalizeDay(b.dayOfWeek));
          return (aDay === -1 ? 7 : aDay) - (bDay === -1 ? 7 : bDay);
        });
        if (mounted) setWorkingHours(sorted);
      } catch (err) {
        console.error('Failed to fetch working hours preview', err);
      }
    };

    fetchHours();

    return () => { mounted = false; };
  }, [session]);

  const handleLogout = async () => {
    await fetch('/api/teacher/logout', { method: 'POST' });
    eventBus.emit('teacherLogout');
    router.push('/teacher/login');
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
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-semibold text-foreground">Teacher Dashboard</h1>
            <Button variant="danger" size="sm" onClick={handleLogout} className="py-2">
              Logout
            </Button>
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">
              Welcome back, <strong>{session.email}</strong>!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-white to-blue-50 border border-foreground/20 shadow-sm rounded-lg p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Student Management</h2>
              <p className="text-foreground/70 mb-4">View and manage your students</p>
              <a
                href="/teacher/admin/students"
                className="inline-flex items-center gap-2 text-foreground hover:text-foreground/80 font-medium"
              >
                Manage Students <FaChevronRight className="w-4 h-4" />
              </a>
            </div>

            <div className="bg-gradient-to-br from-white to-blue-50 border border-foreground/20 shadow-sm rounded-lg p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Lesson Schedule</h2>
              <p className="text-foreground/70 mb-4">View upcoming lessons</p>
              <a
                href="/teacher/schedule"
                className="inline-flex items-center gap-2 text-foreground hover:text-foreground/80 font-medium"
              >
                View Schedule <FaChevronRight className="w-4 h-4" />
              </a>
            </div>

            <div className="bg-gradient-to-br from-white to-blue-50 border border-foreground/20 shadow-sm rounded-lg p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Manual Student Entry</h2>
              <p className="text-foreground/70 mb-4">Add new students manually</p>
              <a
                href="/teacher/admin/students/manual-entry"
                className="inline-flex items-center gap-2 text-foreground hover:text-foreground/80 font-medium"
              >
                Add Student <FaChevronRight className="w-4 h-4" />
              </a>
            </div>

            <div className="bg-gradient-to-br from-white to-blue-50 border border-foreground/20 shadow-sm rounded-lg p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Configuration</h2>
              <p className="text-foreground/70 mb-4">Manage application configuration values</p>
              <a
                href="/teacher/admin/configuration"
                className="inline-flex items-center gap-2 text-foreground hover:text-foreground/80 font-medium"
              >
                Manage Configuration <FaChevronRight className="w-4 h-4" />
              </a>
            </div>

            <div className="bg-gradient-to-br from-white to-blue-50 border border-foreground/20 shadow-sm rounded-lg p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Working Hours</h2>
              <p className="text-foreground/70 mb-3">Set the weekly availability for lessons</p>
              <div className="mb-3 text-sm text-foreground/80">
                {workingHours.length > 0 ? (
                  <div className="space-y-1">
                    {workingHours.map((w) => (
                      <div key={w.id} className="flex justify-between items-center">
                        <div className="font-medium text-foreground/90">{w.dayOfWeek}</div>
                        <div className="text-foreground/70">{convertTo12Hour(w.startTime)} — {convertTo12Hour(w.endTime)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-foreground/60">No working hours configured.</div>
                )}
              </div>
              <a
                href="/teacher/admin/working-hours"
                className="inline-flex items-center gap-2 text-foreground hover:text-foreground/80 font-medium"
              >
                Manage Working Hours <FaChevronRight className="w-4 h-4" />
              </a>
            </div>

            <div className="bg-gradient-to-br from-white to-blue-50 border border-foreground/20 shadow-sm rounded-lg p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Lesson Time Suggestion</h2>
              <p className="text-foreground/70 mb-4">Get suggested times for new students based on your schedule</p>
              <a
                href="/teacher/suggest-time"
                className="inline-flex items-center gap-2 text-foreground hover:text-foreground/80 font-medium"
              >
                Suggest Time <FaChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// working-hours fetch moved into component