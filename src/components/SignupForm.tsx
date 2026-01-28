'use client';

import { useState, useEffect } from 'react';
import { StudentEntry } from '../schema/student-entry';
import Button from './Button';
import { useToast } from './ToastContext';
import { validateStudentData } from '../lib/validation';

interface SignupFormProps {
    buttonText?: string;
    mode: 'signup' | 'waitingList' | 'manual';
}

export default function SignupForm({ buttonText = "Sign Up", mode = 'signup' }: SignupFormProps) {
  const [formData, setFormData] = useState<Omit<StudentEntry, 'id' | 'notes'>>({
    studentName: '',
    phoneNumber: '',
    emailAddress: '',
    age: 0,
    lessonDay: '',
    lessonTime: '',
    duration: '',
    skillLevel: '',
    startDate: '',
    minutelyRate: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  // Fetch default rate for signup, waiting list, and manual modes
  useEffect(() => {
    const fetchDefaultRate = async () => {
      if (mode === 'signup' || mode === 'waitingList' || mode === 'manual') {
        try {
          const res = await fetch('/api/piano/pricing');
          if (res.ok) {
            const data = await res.json();
            // Prefer explicit formatted `rate` from the API; fall back to pricing array if present
            if (data.rate) {
              setFormData(prev => ({ ...prev, minutelyRate: data.rate }));
            } else if (data.pricing && data.pricing.length > 0 && data.pricing[0].cost) {
              // If API returned costs, use the per-minute rate approximation from cost/length
              const approxRate = (parseFloat(data.pricing[0].cost) / data.pricing[0].length).toFixed(2);
              setFormData(prev => ({ ...prev, minutelyRate: `$${approxRate}` }));
            }
          }
        } catch (error) {
          console.error('Error fetching pricing:', error);
        }
      }
    };

    fetchDefaultRate();
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation using shared validation functions
    const validation = validateStudentData(formData, mode === 'manual');
    if (!validation.isValid) {
      showToast(validation.message!, 'error');
      return;
    }

    setIsSubmitting(true);

    const url = mode === 'signup' ? '/api/piano/signup' : mode === 'waitingList' ? '/api/piano/waiting-list' : '/api/teacher/students';

    try {
      const body = mode === 'manual' ? { ...formData, type: 'manual' } : formData;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(mode === 'signup' ? 'Thank you for signing up! We will contact you soon.' : mode === 'waitingList' ? 'Thank you! You have been added to the waiting list. We will contact you as soon as a spot opens up.' : 'Student added successfully.', 'success');
        setFormData({
          studentName: '',
          phoneNumber: '',
          emailAddress: '',
          age: 0,
          lessonDay: '',
          lessonTime: '',
          duration: '',
          skillLevel: '',
          startDate: '',
          minutelyRate: '',
        });
      } else {
        showToast(data.error || 'There was an error submitting your information. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showToast('There was an error submitting your information. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label htmlFor="studentName" className="block text-sm font-medium text-foreground mb-2">
              Student Name *
            </label>
            <input
              type="text"
              id="studentName"
              value={formData.studentName}
              onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
              placeholder="Full Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-foreground mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="(555) 123-4567"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="emailAddress" className="block text-sm font-medium text-foreground mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="emailAddress"
              value={formData.emailAddress}
              onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
              placeholder="student@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="age" className="block text-sm font-medium text-foreground mb-2">
              Age *
            </label>
            <input
              type="number"
              id="age"
              min="1"
              max="120"
              value={formData.age || ''}
              onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
              placeholder="Age"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="lessonDay" className="block text-sm font-medium text-foreground mb-2">
              Preferred Lesson Day *
            </label>
            <select
              id="lessonDay"
              value={formData.lessonDay}
              onChange={(e) => setFormData({ ...formData, lessonDay: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a day</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </div>

          <div>
            <label htmlFor="lessonTime" className="block text-sm font-medium text-foreground mb-2">
              Preferred Lesson Time *
            </label>
            <input
              type="time"
              id="lessonTime"
              value={formData.lessonTime}
              onChange={(e) => setFormData({ ...formData, lessonTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-foreground mb-2">
              Lesson Duration *
            </label>
            <select
              id="duration"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select duration</option>
              <option value="00:20:00">20 minutes</option>
              <option value="00:30:00">30 minutes</option>
              <option value="00:45:00">45 minutes</option>
            </select>
          </div>

          <div>
            <label htmlFor="skillLevel" className="block text-sm font-medium text-foreground mb-2">
              Skill Level *
            </label>
            <select
              id="skillLevel"
              value={formData.skillLevel}
              onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select skill level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-foreground mb-2">
              Preferred Start Date *
            </label>
            <input
              type="date"
              id="startDate"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {mode === 'manual' && (
            <div>
              <label htmlFor="minutelyRate" className="block text-sm font-medium text-foreground mb-2">
                Minutely Rate *
              </label>
              <input
                type="text"
                id="minutelyRate"
                value={formData.minutelyRate}
                onChange={(e) => setFormData({ ...formData, minutelyRate: e.target.value })}
                placeholder="e.g., $50.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        <div className="text-center pt-8">
          <Button
            type="submit"
            disabled={isSubmitting}
            variant="primary"
            size="md"
          >
            {isSubmitting ? 'Submitting...' : buttonText}
          </Button>
        </div>
      </form>
    </div>
  );
}