'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { eventBus } from '@/lib/event-bus';

export default function Footer() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/teacher/session');
        setIsLoggedIn(res.ok);
      } catch {
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for logout events
    const handleLogoutEvent = () => {
      setIsLoggedIn(false);
    };

    const handleLoginEvent = () => {
      setIsLoggedIn(true);
    };

    eventBus.on('teacherLogout', handleLogoutEvent);
    eventBus.on('teacherLogin', handleLoginEvent);

    return () => {
      eventBus.off('teacherLogout', handleLogoutEvent);
      eventBus.off('teacherLogin', handleLoginEvent);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/teacher/logout', { method: 'POST' });
      setIsLoggedIn(false);
      eventBus.emit('teacherLogout');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return null; // Or show a loading state if preferred
  }
  return (
    <footer className="bg-foreground text-background border-t border-foreground/10 mt-auto">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-2 mb-2">
              <span className="text-background/80 whitespace-nowrap">Yunbo Heater</span>
              <span className="text-sm text-background/60">Piano Studio</span>
            </div>
            <p className="text-sm text-background/70">
              Personal one-on-one piano lessons for all ages and skill levels
            </p>
          </div>

          <div className="flex items-center gap-4 justify-center md:justify-end w-full md:w-auto">
            {isLoggedIn ? (
              <>
                <a
                  href="/teacher/dashboard"
                  className="text-background/70 hover:text-background transition-colors text-sm font-medium md:ml-4"
                >
                  Teacher Dashboard
                </a>
                <button
                  onClick={handleLogout}
                  className="text-background/70 hover:text-background transition-colors text-sm font-medium md:ml-4"
                >
                  Logout
                </button>
              </>
            ) : (
              <a
                href="/teacher/login"
                className="text-background/70 hover:text-background transition-colors text-sm font-medium md:ml-4"
              >
                Teacher Login
              </a>
            )}
          </div>
        </div>

        <div className="border-t border-background/10 mt-6 pt-6 text-center">
          <p className="text-sm text-background/50">
            © {new Date().getFullYear()} Yunbo Heater Piano Studio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}