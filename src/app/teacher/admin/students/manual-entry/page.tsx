'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SignupForm from '@/components/SignupForm';
import Button from '@/components/Button';

export default function ManualEntryPage() {
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
        console.error('Session check error:', error);
        router.push('/teacher/login');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);

  const handleBackToDashboard = () => {
    router.push('/teacher/dashboard');
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
    return null; // Will redirect
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 text-right">
          <Button
            onClick={handleBackToDashboard}
            variant="primary"
            size="sm"
          >
            Back to Dashboard
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-8 text-center">Manual Student Entry</h1>
        <SignupForm mode="manual" buttonText="Add Student" />
      </div>
    </div>
  );
}