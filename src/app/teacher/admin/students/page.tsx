'use client';

import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StudentEntry } from '@/schema/student-entry';
import { useToast } from '@/components/ToastContext';
import { FaArrowUp, FaTrash } from 'react-icons/fa';
import Button from '@/components/Button';
import { calculateLessonCost } from '@/lib/student-utils';
import ConfirmModal from '@/components/ConfirmModal';

type TabType = 'students' | 'waiting' | 'signups';

export default function StudentManagement() {
  const [students, setStudents] = useState<StudentEntry[]>([]);
  const [waitingList, setWaitingList] = useState<StudentEntry[]>([]);
  const [signups, setSignups] = useState<StudentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('students');
  const router = useRouter();
  const { showToast } = useToast();
  const [promoting, setPromoting] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState<Set<string>>(new Set());
  const [moving, setMoving] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string; type: 'waiting' | 'signup' } | null>(null);
  const [confirmPromote, setConfirmPromote] = useState<{ id: string; name: string; type: 'waiting' | 'signup' } | null>(null);
  const [confirmMove, setConfirmMove] = useState<{ id: string; name: string; type: 'waiting' | 'signup' } | null>(null);

  const studentsButtonRef = useRef<HTMLButtonElement>(null);
  const waitingButtonRef = useRef<HTMLButtonElement>(null);
  const signupsButtonRef = useRef<HTMLButtonElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    try {
      const [studentsRes, waitingRes, signupsRes] = await Promise.all([
        fetch('/api/teacher/students'),
        fetch('/api/teacher/waiting-list'),
        fetch('/api/teacher/signups')
      ]);

      if (studentsRes.ok) {
        const data = await studentsRes.json();
        setStudents(data.students || []);
      }
      if (waitingRes.ok) {
        const data = await waitingRes.json();
        setWaitingList(data.students || []);
      }
      if (signupsRes.ok) {
        const data = await signupsRes.json();
        setSignups(data.students || []);
      }
    } catch (err) {
      setError('Failed to load data');
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

        await fetchData();
      } catch (err) {
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    };

    checkSessionAndFetch();
  }, [router]);

  // Calculate indicator position when active tab changes
  useLayoutEffect(() => {
    if (loading) return; // Don't position during loading

    const updateIndicator = () => {
      let buttonRef: HTMLButtonElement | null = null;

      switch (activeTab) {
        case 'students':
          buttonRef = studentsButtonRef.current;
          break;
        case 'waiting':
          buttonRef = waitingButtonRef.current;
          break;
        case 'signups':
          buttonRef = signupsButtonRef.current;
          break;
      }

      if (buttonRef && indicatorRef.current && buttonRef.offsetWidth > 0) {
        indicatorRef.current.style.left = `${buttonRef.offsetLeft}px`;
        indicatorRef.current.style.width = `${buttonRef.offsetWidth}px`;
      }
    };

    // Wait for DOM to be ready
    const timeoutId = setTimeout(updateIndicator, 100);

    return () => clearTimeout(timeoutId);
  }, [activeTab, loading]);

  // Update indicator when data changes (button text/counts change)
  useLayoutEffect(() => {
    if (loading) return;

    const updateIndicator = () => {
      let buttonRef: HTMLButtonElement | null = null;

      switch (activeTab) {
        case 'students':
          buttonRef = studentsButtonRef.current;
          break;
        case 'waiting':
          buttonRef = waitingButtonRef.current;
          break;
        case 'signups':
          buttonRef = signupsButtonRef.current;
          break;
      }

      if (buttonRef && indicatorRef.current && buttonRef.offsetWidth > 0) {
        indicatorRef.current.style.left = `${buttonRef.offsetLeft}px`;
        indicatorRef.current.style.width = `${buttonRef.offsetWidth}px`;
      }
    };

    updateIndicator();
  }, [students.length, waitingList.length, signups.length, loading]);

  const promoteStudent = async (id: string, type: 'waiting' | 'signup') => {
    setPromoting(prev => new Set(prev).add(id));
    try {
      const res = await fetch('/api/teacher/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type }),
      });
      if (res.ok) {
        await fetchData(); // Refresh data
        showToast('Student promoted successfully!', 'success');
      } else {
        showToast('Failed to promote student', 'error');
      }
    } catch (err) {
      showToast('An error occurred during promotion', 'error');
    } finally {
      setPromoting(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      setConfirmPromote(null);
    }
  };

  const moveStudent = async (id: string, fromType: 'waiting' | 'signup') => {
    setMoving(prev => new Set(prev).add(id));
    try {
      // Find the student data from local state
      const student = fromType === 'waiting' ? waitingList.find(s => s.id === id) : signups.find(s => s.id === id);
      if (!student) {
        showToast('Student not found', 'error');
        return;
      }

      // Delete from source via teacher API
      const deleteEndpoint = fromType === 'waiting' ? '/api/teacher/waiting-list' : '/api/teacher/signups';
      const deleteRes = await fetch(deleteEndpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!deleteRes.ok) {
        showToast('Failed to remove from source list', 'error');
        return;
      }

      // Post to target piano endpoint
      const target = fromType === 'waiting' ? 'signup' : 'waiting-list';
      const postEndpoint = fromType === 'waiting' ? '/api/piano/signup' : '/api/piano/waiting-list';
      const postRes = await fetch(postEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student),
      });
      if (postRes.ok) {
        await fetchData();
        showToast('Student moved successfully!', 'success');
      } else {
        const err = await postRes.json().catch(() => ({}));
        showToast(err?.error || 'Failed to add to target list', 'error');
      }
    } catch (err) {
      showToast('An error occurred during move', 'error');
    } finally {
      setMoving(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      setConfirmMove(null);
    }
  };

  const deleteStudent = async (id: string, type: 'waiting' | 'signup') => {
    setDeleting(prev => new Set(prev).add(id));
    try {
      const endpoint = type === 'waiting' ? '/api/teacher/waiting-list' : '/api/teacher/signups';
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        await fetchData(); // Refresh data
        showToast('Student deleted successfully!', 'success');
      } else {
        showToast('Failed to delete student', 'error');
      }
    } catch (err) {
      showToast('An error occurred during deletion', 'error');
    } finally {
      setDeleting(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      setConfirmDelete(null);
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

  if (error) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <Button variant="primary" size="sm" onClick={() => router.push('/teacher/dashboard')} className="mt-4 py-2">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const renderCards = (data: StudentEntry[], showPromote: boolean, promoteType?: 'waiting' | 'signup') => {
    if (data.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-slate-600 mb-2">No students found</h3>
          <p className="text-slate-500">
            {showPromote 
              ? promoteType === 'waiting' 
                ? 'The waiting list is currently empty.' 
                : 'There are no pending signups at this time.'
              : 'No students are currently enrolled.'
            }
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((student) => (
          <div
            key={student.id}
            className={`bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-slate-200/30 shadow-sm hover:shadow-md transition-all duration-200 ${showPromote ? '' : 'cursor-pointer'} group`}
            onClick={!showPromote ? () => router.push(`/teacher/admin/student/${student.id}`) : undefined}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                {student.studentName}
              </div>
              {showPromote && promoteType && (
                <div className="flex space-x-1 ml-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmPromote({ id: student.id, name: student.studentName, type: promoteType }); }}
                    disabled={promoting.has(student.id)}
                    className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    title="Promote to students"
                  >
                    {promoting.has(student.id) ? '...' : <FaArrowUp />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmMove({ id: student.id, name: student.studentName, type: promoteType }); }}
                    disabled={moving.has(student.id)}
                    className="p-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    title={promoteType === 'waiting' ? 'Move to signups' : 'Move to waiting list'}
                  >
                    {moving.has(student.id) ? '...' : '⇄'}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmDelete({ id: student.id, name: student.studentName, type: promoteType }); }}
                    disabled={deleting.has(student.id)}
                    className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    title="Delete candidate"
                  >
                    {deleting.has(student.id) ? '...' : <FaTrash />}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-1 text-sm text-slate-600 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                <span className="font-medium">Email:</span> {student.emailAddress}
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                <span className="font-medium">Phone:</span> {student.phoneNumber}
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                <span className="font-medium">Day:</span> {student.lessonDay} at {student.lessonTime}
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span className="font-medium">Skill:</span> {student.skillLevel}, Age {student.age}
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                <span className="font-medium">Duration:</span> {student.duration}
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                <span className="font-medium">Start Date:</span> {student.startDate}
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
                <span className="font-medium">Rate:</span> {student.minutelyRate}/min
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                <span className="font-medium">Cost:</span> ${calculateLessonCost(student.minutelyRate, student.duration)}
              </div>
            </div>

            {/* Notes intentionally not shown on student cards; edit page only */}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-background py-16">
      <div className="container">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-semibold text-foreground">Student Management</h1>
            <Button variant="primary" size="sm" onClick={() => router.push('/teacher/dashboard')} className="py-2">
              Back to Dashboard
            </Button>
          </div>

          <div className="mb-6">
            <div className="inline-flex bg-gray-100 rounded-lg p-1 border border-gray-200 relative overflow-hidden">
              {/* Sliding indicator */}
              <div
                ref={indicatorRef}
                className="absolute top-1 bottom-1 bg-white rounded-md shadow-sm transition-all duration-300 ease-in-out"
              />
              <button
                ref={studentsButtonRef}
                onClick={() => setActiveTab('students')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 relative z-10 min-w-0 ${
                  activeTab === 'students'
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Current Students ({students.length})
              </button>
              <button
                ref={waitingButtonRef}
                onClick={() => setActiveTab('waiting')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 relative z-10 min-w-0 ${
                  activeTab === 'waiting'
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Waiting List ({waitingList.length})
              </button>
              <button
                ref={signupsButtonRef}
                onClick={() => setActiveTab('signups')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 relative z-10 min-w-0 ${
                  activeTab === 'signups'
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Signups ({signups.length})
              </button>
            </div>
          </div>

          <div className="bg-white border border-foreground/20 rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                {activeTab === 'students' ? 'Current Students' : activeTab === 'waiting' ? 'Waiting List' : 'Signups'}
              </h2>
              {activeTab === 'students' && renderCards(students, false)}
              {activeTab === 'waiting' && renderCards(waitingList, true, 'waiting')}
              {activeTab === 'signups' && renderCards(signups, true, 'signup')}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={!!confirmDelete}
        title="Confirm Deletion"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && deleteStudent(confirmDelete.id, confirmDelete.type)}
        loading={confirmDelete ? deleting.has(confirmDelete.id) : false}
        cancelLabel="Cancel"
        confirmLabel="Delete"
        confirmVariant="danger"
      >
        Are you sure you want to delete <strong>{confirmDelete?.name}</strong> from the {confirmDelete?.type === 'waiting' ? 'waiting list' : 'signups'}? This action cannot be undone.
      </ConfirmModal>

      <ConfirmModal
        open={!!confirmPromote}
        title="Confirm Promotion"
        onCancel={() => setConfirmPromote(null)}
        onConfirm={() => confirmPromote && promoteStudent(confirmPromote.id, confirmPromote.type)}
        loading={confirmPromote ? promoting.has(confirmPromote.id) : false}
        cancelLabel="Cancel"
        confirmLabel="Promote"
        confirmVariant="primary"
      >
        Are you sure you want to promote <strong>{confirmPromote?.name}</strong> from the {confirmPromote?.type === 'waiting' ? 'waiting list' : 'signups'} to the student roll?
      </ConfirmModal>

      <ConfirmModal
        open={!!confirmMove}
        title="Confirm Move"
        onCancel={() => setConfirmMove(null)}
        onConfirm={() => confirmMove && moveStudent(confirmMove.id, confirmMove.type)}
        loading={confirmMove ? moving.has(confirmMove.id) : false}
        cancelLabel="Cancel"
        confirmLabel="Move"
        confirmVariant="primary"
      >
        Are you sure you want to move <strong>{confirmMove?.name}</strong> from the {confirmMove?.type === 'waiting' ? 'waiting list' : 'signups'} to the {confirmMove?.type === 'waiting' ? 'signups' : 'waiting list'}?
      </ConfirmModal>
    </div>
  );
}