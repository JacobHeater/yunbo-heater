'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import { useToast } from '@/components/ToastContext';
import { validateEmail, validateRequired } from '@/lib/validation';
import { eventBus } from '@/lib/event-bus';

export default function TeacherLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/teacher/session');
        if (res.ok) {
          router.push('/teacher/dashboard');
        }
      } catch (error) {
        // Not logged in, continue
      }
    };

    checkSession();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    const emailValidation = validateRequired(formData.email, 'Email');
    if (!emailValidation.isValid) {
      showToast(emailValidation.message!, 'error');
      return;
    }

    const emailFormatValidation = validateEmail(formData.email);
    if (!emailFormatValidation.isValid) {
      showToast(emailFormatValidation.message!, 'error');
      return;
    }

    const passwordValidation = validateRequired(formData.password, 'Password');
    if (!passwordValidation.isValid) {
      showToast(passwordValidation.message!, 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Making login request...');
      const res = await fetch('/api/teacher/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      console.log('Login response status:', res.status);

      if (res.ok) {
        console.log('Login successful, redirecting...');
        showToast('Login successful!', 'success');
        eventBus.emit('teacherLogin');
        router.push('/teacher/dashboard');
      } else {
        const data = await res.json();
        console.log('Login failed:', data);
        showToast(data.message || 'Login failed', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast('An error occurred during login', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-background flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-8 shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-foreground mb-2">Teacher Login</h1>
            <p className="text-foreground/70">Access your teacher dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground bg-white text-foreground"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground bg-white text-foreground"
                placeholder="Enter your password"
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
