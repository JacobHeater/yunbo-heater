'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaChevronRight } from 'react-icons/fa';
import { eventBus } from '@/lib/event-bus';
import Button from '@/components/Button';

export default function TeacherDashboard() {
  const [session, setSession] = useState<{ email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
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
      } catch (error) {
        router.push('/teacher/login');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);

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
          </div>
        </div>
      </div>
    </div>
  );
}