import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { squadsApi } from '@/services/api';
import { Interest } from '@/types';
import { Users, MapPin, Loader2, ChevronLeft } from 'lucide-react';

export default function SquadCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    destination: '',
    description: '',
    maxMembers: 8,
    isPrivate: false,
  });

  const update = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await squadsApi.create(form);
      navigate(`/squads/${data.squad._id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create squad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container py-8 max-w-lg">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="font-display text-3xl font-bold text-slate-900 mb-1">Create a squad</h1>
      <p className="text-slate-500 mb-8">Start a travel group and invite others to join.</p>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="ts-card p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Squad name *</label>
            <div className="relative">
              <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text" required minLength={3} maxLength={60}
                value={form.name} onChange={e => update('name', e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ocean-500 transition"
                placeholder="e.g. Bali Backpackers 2025"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Destination *</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text" required
                value={form.destination} onChange={e => update('destination', e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ocean-500 transition"
                placeholder="e.g. Bali, Indonesia"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              value={form.description} onChange={e => update('description', e.target.value)}
              rows={3} maxLength={500}
              className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ocean-500 transition resize-none text-sm"
              placeholder="What kind of travelers are you looking for? What's the vibe?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Max members <span className="text-slate-400 font-normal">(2–20)</span>
            </label>
            <input
              type="number" value={form.maxMembers} min={2} max={20}
              onChange={e => update('maxMembers', Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ocean-500 transition"
            />
          </div>
        </div>

        <div className="ts-card p-5 flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-900 text-sm">Private squad</p>
            <p className="text-xs text-slate-500 mt-0.5">Only visible to people with a direct link</p>
          </div>
          <button
            type="button"
            onClick={() => update('isPrivate', !form.isPrivate)}
            className={`relative w-11 h-6 rounded-full transition-colors ${form.isPrivate ? 'bg-ocean-500' : 'bg-slate-200'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isPrivate ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full py-4 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-base"
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          Create squad
        </button>
      </form>
    </div>
  );
}
