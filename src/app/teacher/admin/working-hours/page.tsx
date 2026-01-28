"use client";

import { useEffect, useState } from 'react';
import Button from '@/components/Button';
import { useToast } from '@/components/ToastContext';
import { useRouter } from 'next/navigation';
import type { WorkingHours } from '@/schema/working-hours';

const DAY_OPTIONS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

function formatTime(time24: string): string {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  let hour12 = parseInt(hours);
  const ampm = hour12 >= 12 ? 'PM' : 'AM';
  if (hour12 > 12) hour12 -= 12;
  if (hour12 === 0) hour12 = 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export default function WorkingHoursAdmin() {
  const [hours, setHours] = useState<WorkingHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' });
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
      showToast('Saved', 'success');
      setShowForm(false);
      // refresh
      router.refresh();
    } catch (err) {
      console.error(err);
      showToast('Failed to save working hours', 'error');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this working hour?')) return;
    try {
      const res = await fetch('/api/teacher/working-hours', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'delete failed');
      showToast('Deleted', 'success');
      router.refresh();
    } catch (err) {
      console.error(err);
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
              <div className="text-sm text-foreground/70">{formatTime(h.startTime)} — {formatTime(h.endTime)}</div>
            </div>
            <div className="flex-shrink-0 flex gap-2">
              <Button size="sm" variant="primary" onClick={() => startEdit(h)}>Edit</Button>
              <Button size="sm" variant="danger" onClick={() => remove(h.id)}>Delete</Button>
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
  </div>
);
}
