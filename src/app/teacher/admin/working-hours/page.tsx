"use client";

import { useEffect, useState } from 'react';
import Button from '@/components/Button';
import ConfirmModal from '@/components/ConfirmModal';
import { useToast } from '@/components/ToastContext';
import { useRouter } from 'next/navigation';
import type { WorkingHours } from '@/schema/working-hours';
import { convertTo12Hour } from '@/lib/time-utils';

const DAY_OPTIONS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

export default function WorkingHoursAdmin() {
  const [hours, setHours] = useState<WorkingHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const fetchHours = async () => {
      try {
        const res = await fetch('/api/teacher/working-hours');
        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json();
        const items: WorkingHours[] = (data.workingHours || []).slice();
        const order = DAY_OPTIONS;
        items.sort((a,b) => order.indexOf(a.dayOfWeek) - order.indexOf(b.dayOfWeek));
        if (mounted) setHours(items);
      } catch (err) {
        console.error(err);
        showToast('Failed to load working hours', 'error');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchHours();
    return () => { mounted = false; };
  }, [showToast]);

  const startEdit = (h?: WorkingHours) => {
    setShowForm(true);
    if (!h) {
      setEditingId(null);
      setForm({ dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' });
      return;
    }
    setEditingId(h.id);
    setForm({ dayOfWeek: h.dayOfWeek, startTime: h.startTime, endTime: h.endTime });
  };

  const save = async () => {
    try {
      const method = editingId ? 'PUT' : 'POST';
      const payload = editingId ? { id: editingId, ...form } : { ...form };
      const res = await fetch('/api/teacher/working-hours', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'save failed');
      
      // Update local state instead of refreshing
      if (editingId) {
        // Update existing item
        setHours(prev => prev.map(h => h.id === editingId ? { ...h, ...form } : h));
      } else {
        // Add new item
        const newHour: WorkingHours = { id: data.id || Date.now().toString(), ...form };
        setHours(prev => {
          const updated = [...prev, newHour];
          const order = DAY_OPTIONS;
          return updated.sort((a,b) => order.indexOf(a.dayOfWeek) - order.indexOf(b.dayOfWeek));
        });
      }
      
      showToast('Saved', 'success');
      setShowForm(false);
    } catch (err) {
      console.error(err);
      showToast('Failed to save working hours', 'error');
    }
  };

  const startDelete = (id: string) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingId(null);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    
    try {
      const res = await fetch('/api/teacher/working-hours', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: deletingId }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'delete failed');
      
      // Instead of updating local state, refetch all data to ensure consistency
      const fetchRes = await fetch('/api/teacher/working-hours');
      if (fetchRes.ok) {
        const fetchData = await fetchRes.json();
        const items: WorkingHours[] = (fetchData.workingHours || []).slice();
        const order = DAY_OPTIONS;
        items.sort((a,b) => order.indexOf(a.dayOfWeek) - order.indexOf(b.dayOfWeek));
        setHours(items);
      }
      
      showToast('Deleted', 'success');
      setShowDeleteModal(false);
      setDeletingId(null);
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Failed to delete', 'error');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-background py-16">
      <div className="container">
        <div className="mb-6 text-right">
            <Button variant='primary' onClick={() => router.push('/teacher/dashboard')}>Return to Dashboard</Button>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Manage Working Hours</h1>
        <Button size="sm" variant="secondary" onClick={() => startEdit()}>
          Add New
        </Button>
      </div>

      <div className="space-y-4">
        {hours.length === 0 && <div className="text-sm text-foreground/70">No working hours configured.</div>}
        {hours.map(h => (
          <div key={h.id} className="flex items-center justify-between gap-4 p-3 border border-gray-100 rounded">
            <div className="flex-1 min-w-0">
              <div className="font-medium">{h.dayOfWeek}</div>
              <div className="text-sm text-foreground/70">{convertTo12Hour(h.startTime)} — {convertTo12Hour(h.endTime)}</div>
            </div>
            <div className="flex-shrink-0 flex gap-2">
              <Button size="sm" variant="primary" onClick={() => startEdit(h)}>Edit</Button>
              <Button size="sm" variant="danger" onClick={() => startDelete(h.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="mt-6 border-t pt-4">
          <h2 className="text-lg font-medium mb-4">{editingId ? 'Edit Working Hour' : 'Add New Working Hour'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-xs text-foreground/70 mb-1">Day</label>
              <select value={form.dayOfWeek} onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })} className="w-full px-3 py-2 border rounded">
                {DAY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs text-foreground/70 mb-1">Start</label>
              <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="w-full px-3 py-2 border rounded" />
            </div>

            <div>
              <label className="block text-xs text-foreground/70 mb-1">End</label>
              <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="w-full px-3 py-2 border rounded" />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="primary" onClick={save}>Save</Button>
            <Button size="sm" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
    </div>
  </div>

  <ConfirmModal
    open={showDeleteModal}
    title="Delete Working Hour"
    onCancel={cancelDelete}
    onConfirm={confirmDelete}
  >
    Are you sure you want to delete this working hour? This action cannot be undone.
  </ConfirmModal>
  </div>
);
}
