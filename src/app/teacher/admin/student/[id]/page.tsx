'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { StudentEntry } from '@/schema/student-entry';
import Button from '@/components/Button';
import { useToast } from '@/components/ToastContext';
import { convertTo12Hour, convertTo24Hour, parseFormattedDuration, parseFormattedDate } from '@/lib/time-utils';
import { calculateLessonCost } from '@/lib/student-utils';
import ReactMarkdown from 'react-markdown';
import dynamic from 'next/dynamic';
import ConfirmModal from '@/components/ConfirmModal';

// Dynamically import the markdown editor to avoid SSR issues
const MdEditor = dynamic(() => import('react-markdown-editor-lite'), {
  ssr: false,
  loading: () => <div className="h-32 bg-gray-100 rounded border flex items-center justify-center text-gray-500">Loading editor...</div>
});

// Import the CSS for the markdown editor
import 'react-markdown-editor-lite/lib/index.css';

export default function StudentDetailPage() {
  const [student, setStudent] = useState<StudentEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<{ email: string; role: string } | null>(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesContent, setNotesContent] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<StudentEntry>>({});
  const [saving, setSaving] = useState(false);
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
          // If we just deleted the student, avoid showing an error toast
          if (!deletedRef.current) {
            showToast('Student not found', 'error');
          }
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

    // A ref set when we intentionally delete the student so subsequent
    // fetches that return 404 don't trigger an error toast.
    const deletedRef = useRef(false);

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

  const handleEditStudent = () => {
    if (!student || loading) return;
    setIsEditing(true);
    setEditForm({
      ...student,
      lessonTime: student.lessonTime ? convertTo24Hour(student.lessonTime) : '',
      duration: student.duration ? parseFormattedDuration(student.duration) : '',
      startDate: student.startDate ? parseFormattedDate(student.startDate) : ''
    });
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!student) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/teacher/student/${student.id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Student deleted', 'success');
        // mark deleted so the fetch effect won't show a not-found toast
        deletedRef.current = true;
        router.push('/teacher/admin/students');
      } else {
        showToast('Failed to delete student', 'error');
      }
    } catch (err) {
      console.error('Delete error:', err);
      showToast('An error occurred while deleting', 'error');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({});
  };

  const handleSaveStudent = async () => {
    if (!student) return;

    // Convert time from 24-hour format (from time input) to 12-hour AM/PM format for storage
    const dataToSave = {
      ...editForm,
      lessonTime: editForm.lessonTime ? convertTo12Hour(editForm.lessonTime) : ''
    };

    console.log('Saving student with data:', dataToSave);
    setSaving(true);
    try {
      const res = await fetch(`/api/teacher/student/${student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      });

      console.log('API response status:', res.status);
      const data = await res.json();
      console.log('API response data:', data);

      if (res.ok) {
        setStudent(data.student);
        setIsEditing(false);
        setEditForm({});
        showToast('Student updated successfully!', 'success');
      } else {
        console.error('API error:', data);
        showToast('Failed to update student', 'error');
      }
    } catch (error) {
      console.error('Error saving student:', error);
      showToast('An error occurred while saving student', 'error');
    } finally {
      setSaving(false);
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
    <>
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
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-foreground">
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.studentName || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, studentName: e.target.value }))}
                    className="text-3xl font-bold border rounded px-2 py-1 w-full"
                    placeholder="Student name"
                  />
                ) : (
                  student.studentName
                )}
              </h1>
              {!isEditing ? (
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={handleEditStudent}
                    variant="primary"
                    size="sm"
                    disabled={!student || loading}
                  >
                    Edit Student
                  </Button>
                  <Button
                    onClick={() => setShowDeleteConfirm(true)}
                    variant="danger"
                    size="sm"
                    disabled={!student || loading}
                  >
                    Delete
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    onClick={handleSaveStudent}
                    variant="primary"
                    size="sm"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    variant="secondary"
                    size="sm"
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      <span className="font-medium text-gray-600">Email:</span>
                      {isEditing ? (
                        <input
                          type="email"
                          value={editForm.emailAddress || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, emailAddress: e.target.value }))}
                          className="flex-1 border rounded px-2 py-1"
                          placeholder="Email address"
                        />
                      ) : (
                        <span className="text-gray-900">{student.emailAddress}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span className="font-medium text-gray-600">Phone:</span>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editForm.phoneNumber || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                          className="flex-1 border rounded px-2 py-1"
                          placeholder="Phone number"
                        />
                      ) : (
                        <span className="text-gray-900">{student.phoneNumber}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Personal Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                      <span className="font-medium text-gray-600">Age:</span>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.age || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                          className="w-20 border rounded px-2 py-1"
                          min="1"
                          max="120"
                        />
                      ) : (
                        <span className="text-gray-900">{student.age}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                      <span className="font-medium text-gray-600">Skill Level:</span>
                      {isEditing ? (
                        <select
                          value={editForm.skillLevel || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, skillLevel: e.target.value }))}
                          className="border rounded px-2 py-1"
                        >
                          <option value="">Select level</option>
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      ) : (
                        <span className="text-gray-900">{student.skillLevel}</span>
                      )}
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
                      {isEditing ? (
                        <select
                          value={editForm.lessonDay || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, lessonDay: e.target.value }))}
                          className="border rounded px-2 py-1"
                        >
                          <option value="">Select day</option>
                          <option value="Monday">Monday</option>
                          <option value="Tuesday">Tuesday</option>
                          <option value="Wednesday">Wednesday</option>
                          <option value="Thursday">Thursday</option>
                          <option value="Friday">Friday</option>
                          <option value="Saturday">Saturday</option>
                          <option value="Sunday">Sunday</option>
                        </select>
                      ) : (
                        <span className="text-gray-900">{student.lessonDay}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                      <span className="font-medium text-gray-600">Time:</span>
                      {isEditing ? (
                        <input
                          type="time"
                          value={editForm.lessonTime || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, lessonTime: e.target.value }))}
                          className="border rounded px-2 py-1"
                        />
                      ) : (
                        <span className="text-gray-900">{student.lessonTime}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                      <span className="font-medium text-gray-600">Duration:</span>
                      {isEditing ? (
                        <select
                          value={editForm.duration || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, duration: e.target.value }))}
                          className="border rounded px-2 py-1"
                        >
                          <option value="">Select duration</option>
                          <option value="01:00:00">60 minutes</option>
                          <option value="00:30:00">30 minutes</option>
                          <option value="00:45:00">45 minutes</option>
                        </select>
                      ) : (
                        <span className="text-gray-900">{student.duration}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
                      <span className="font-medium text-gray-600">Start Date:</span>
                      {isEditing ? (
                        <input
                          type="date"
                          value={editForm.startDate || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, startDate: e.target.value }))}
                          className="border rounded px-2 py-1"
                        />
                      ) : (
                        <span className="text-gray-900">{student.startDate}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span className="font-medium text-gray-600">Minutely Rate:</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.minutelyRate || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, minutelyRate: e.target.value }))}
                          className="border rounded px-2 py-1 w-24"
                          placeholder="$50.00"
                        />
                      ) : (
                        <span className="text-gray-900">{student.minutelyRate}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                      <span className="font-medium text-gray-600">Lesson Cost:</span>
                      <span className="text-gray-900">
                        ${calculateLessonCost(
                          isEditing ? (editForm.minutelyRate || student.minutelyRate) : student.minutelyRate,
                          isEditing ? (editForm.duration || student.duration) : student.duration
                        )}
                      </span>
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
                    <div className="border rounded-lg overflow-hidden">
                      <MdEditor
                        value={notesContent}
                        onChange={({ text }) => setNotesContent(text)}
                        renderHTML={(text) => <ReactMarkdown>{text}</ReactMarkdown>}
                        style={{
                          height: '300px',
                          border: 'none',
                          borderRadius: '0'
                        }}
                        config={{
                          view: {
                            menu: true,
                            md: true,
                            html: false
                          },
                          canView: {
                            menu: true,
                            md: true,
                            html: true,
                            fullScreen: false,
                            hideMenu: false
                          }
                        }}
                        placeholder="Enter notes here... Use Markdown for formatting."
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
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>{student.notes}</ReactMarkdown>
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
      <ConfirmModal
        open={showDeleteConfirm}
        title="Confirm deletion"
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        loading={deleting}
        cancelLabel="Cancel"
        confirmLabel="Delete"
        confirmVariant="danger"
      >
        Are you sure you want to delete this student? This action cannot be undone.
      </ConfirmModal>
    </>
  );
}

// Delete confirmation modal (portal-less simple modal)
function DeleteModal({ open, onCancel, onConfirm, loading }: { open: boolean; onCancel: () => void; onConfirm: () => void; loading: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel}></div>
      <div className="bg-white rounded-lg shadow-lg z-10 w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4">Confirm deletion</h3>
        <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this student? This action cannot be undone.</p>
        <div className="flex justify-end space-x-3">
          <Button variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
          <Button variant="danger" size="sm" onClick={onConfirm} disabled={loading}>{loading ? 'Deleting...' : 'Delete'}</Button>
        </div>
      </div>
    </div>
  );
}

export { DeleteModal };