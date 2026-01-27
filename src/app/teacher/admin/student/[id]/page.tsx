'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { StudentEntryRow } from '@/schema/student-entry';
import Button from '@/components/Button';
import { useToast } from '@/components/ToastContext';
import dynamic from 'next/dynamic';

// Dynamically import the markdown editor to avoid SSR issues
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });
const MDEditorMarkdown = dynamic(() => import('@uiw/react-md-editor').then(mod => mod.default.Markdown), { ssr: false });

export default function StudentDetailPage() {
  const [student, setStudent] = useState<StudentEntryRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<{ email: string; role: string } | null>(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesContent, setNotesContent] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/teacher/session');
        if (res.ok) {
          const data = await res.json();
          setSession(data.user);
        } else {
          router.push('/teacher/login');
          return;
        }
      } catch (error) {
        console.error('Session check error:', error);
        router.push('/teacher/login');
        return;
      }
    };

    checkSession();
  }, [router]);

  useEffect(() => {
    const fetchStudent = async () => {
      if (!session || !params.id) return;

      try {
        const res = await fetch(`/api/teacher/student/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setStudent(data.student);
          setNotesContent(data.student.notes || '');
        } else if (res.status === 404) {
          showToast('Student not found', 'error');
          router.push('/teacher/admin/students');
        } else {
          showToast('Failed to load student', 'error');
        }
      } catch (error) {
        console.error('Error fetching student:', error);
        showToast('An error occurred while loading the student', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [session, params.id, router, showToast]);

  const handleBackToStudents = () => {
    router.push('/teacher/admin/students');
  };

  const handleBackToDashboard = () => {
    router.push('/teacher/dashboard');
  };

  const handleEditNotes = () => {
    setIsEditingNotes(true);
  };

  const handleCancelEditNotes = () => {
    setNotesContent(student?.notes || '');
    setIsEditingNotes(false);
  };

  const handleSaveNotes = async () => {
    if (!student) return;

    setSavingNotes(true);
    try {
      const res = await fetch(`/api/teacher/student/${student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notesContent }),
      });

      if (res.ok) {
        const data = await res.json();
        setStudent(data.student);
        setIsEditingNotes(false);
        showToast('Notes updated successfully!', 'success');
      } else {
        showToast('Failed to update notes', 'error');
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      showToast('An error occurred while saving notes', 'error');
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-foreground/70">Loading student details...</p>
        </div>
      </div>
    );
  }

  if (!session || !student) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-end items-center mb-6">
          <div className="flex space-x-4">
            <Button
              onClick={handleBackToStudents}
              variant="primary"
              size="sm"
            >
              Back to Students
            </Button>
            <Button
              onClick={handleBackToDashboard}
              variant="primary"
              size="sm"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-foreground mb-8 text-center">
            {student.studentName}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span className="font-medium text-gray-600">Email:</span>
                    <span className="text-gray-900">{student.emailAddress}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span className="font-medium text-gray-600">Phone:</span>
                    <span className="text-gray-900">{student.phoneNumber}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Personal Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                    <span className="font-medium text-gray-600">Age:</span>
                    <span className="text-gray-900">{student.age}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                    <span className="font-medium text-gray-600">Skill Level:</span>
                    <span className="text-gray-900">{student.skillLevel}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Lesson Schedule</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                    <span className="font-medium text-gray-600">Day:</span>
                    <span className="text-gray-900">{student.lessonDay}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                    <span className="font-medium text-gray-600">Time:</span>
                    <span className="text-gray-900">{student.lessonTime}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                    <span className="font-medium text-gray-600">Duration:</span>
                    <span className="text-gray-900">{student.duration}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
                    <span className="font-medium text-gray-600">Start Date:</span>
                    <span className="text-gray-900">{student.startDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {student.notes || isEditingNotes ? (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-foreground">Notes</h3>
                {!isEditingNotes && (
                  <Button
                    onClick={handleEditNotes}
                    variant="secondary"
                    size="sm"
                  >
                    Edit Notes
                  </Button>
                )}
              </div>
              {isEditingNotes ? (
                <div className="space-y-4">
                  <div data-color-mode="light">
                    <MDEditor
                      value={notesContent}
                      onChange={(value) => setNotesContent(value || '')}
                      preview="edit"
                      hideToolbar={false}
                      visibleDragbar={false}
                      height={200}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSaveNotes}
                      variant="primary"
                      size="sm"
                      disabled={savingNotes}
                    >
                      {savingNotes ? 'Saving...' : 'Save Notes'}
                    </Button>
                    <Button
                      onClick={handleCancelEditNotes}
                      variant="secondary"
                      size="sm"
                      disabled={savingNotes}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  {student.notes ? (
                  <div className="prose prose-sm max-w-none" data-color-mode="light">
                      <MDEditorMarkdown source={student.notes} />
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No notes yet. Click &quot;Edit Notes&quot; to add some.</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-foreground">Notes</h3>
                <Button
                  onClick={handleEditNotes}
                  variant="secondary"
                  size="sm"
                >
                  Add Notes
                </Button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-500 italic">No notes yet. Click &quot;Add Notes&quot; to get started.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}