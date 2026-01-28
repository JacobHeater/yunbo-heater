"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import { useToast } from '@/components/ToastContext';

interface ConfigItem {
  id: string;
  key: string;
  value: string;
  type: string;
}

export default function ConfigurationPage() {
  const [session, setSession] = useState<{ email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editType, setEditType] = useState('string');
  const router = useRouter();
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

  useEffect(() => {
    if (!session) return;
    fetchConfigs();
  }, [session]);

  const fetchConfigs = async () => {
    try {
      const res = await fetch('/api/teacher/configuration');
      if (res.ok) {
        const data = await res.json();
        setConfigs(data.configurations || []);
      } else {
        showToast('Failed to load configurations', 'error');
      }
    } catch (error) {
      console.error('Error fetching configs:', error);
      showToast('Failed to load configurations', 'error');
    }
  };

  const startEdit = (item: ConfigItem) => {
    setEditingKey(item.key);
    setEditValue(item.value);
    setEditType(item.type);
  };

  const saveEdit = async (key: string) => {
    try {
      const cfg = configs.find(c => c.key === key)!;
      const payload: any = { id: cfg.id, key, value: editValue, type: editType };

      const res = await fetch('/api/teacher/configuration', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Configuration saved', 'success');
        setEditingKey(null);
        fetchConfigs();
      } else {
        showToast(data.error || 'Failed to save', 'error');
      }
    } catch (error) {
      console.error('Save error:', error);
      showToast('Failed to save configuration', 'error');
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

  if (!session) return null;

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">⚙️ Configuration Manager</h1>
          <p className="text-foreground/70">Tweak the app settings to your heart's content!</p>
          <div className="mt-4 text-right">
            <Button size="sm" variant="primary" onClick={() => router.push('/teacher/dashboard')}>Back to dashboard</Button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-6">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="py-3 px-4 text-foreground font-semibold">🔑 Key</th>
                <th className="py-3 px-4 text-foreground font-semibold">💎 Value</th>
                <th className="py-3 px-4 text-foreground font-semibold">🏷️ Type</th>
                <th className="py-3 px-4 text-foreground font-semibold">🎯 Actions</th>
              </tr>
            </thead>
            <tbody>
              {configs.map(cfg => (
                <tr key={cfg.key} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 align-top font-medium">{cfg.key}</td>
                  <td className="py-4 px-4 align-top">
                    {editingKey === cfg.key ? (
                      <input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    ) : (
                      <div className="bg-gray-100 px-3 py-2 rounded-lg">{cfg.value}</div>
                    )}
                  </td>
                  <td className="py-4 px-4 align-top">
                    {editingKey === cfg.key ? (
                      <select value={editType} onChange={(e) => setEditType(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="string">📝 string</option>
                        <option value="number">🔢 number</option>
                        <option value="boolean">✅ boolean</option>
                      </select>
                    ) : (
                      <div className="bg-gray-100 px-3 py-2 rounded-lg inline-block">
                        {cfg.type === 'string' ? '📝' : cfg.type === 'number' ? '🔢' : '✅'} {cfg.type}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4 align-top">
                    {editingKey === cfg.key ? (
                      <div className="flex gap-2">
                        <Button size="sm" variant="primary" onClick={() => saveEdit(cfg.key)} className="hover:scale-105 transition-transform">💾 Save</Button>
                        <Button size="sm" variant="secondary" onClick={() => setEditingKey(null)} className="hover:scale-105 transition-transform">❌ Cancel</Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="primary" onClick={() => startEdit(cfg)} className="hover:scale-105 transition-transform">✏️ Edit</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
