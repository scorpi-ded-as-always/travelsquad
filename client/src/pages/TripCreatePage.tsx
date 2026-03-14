import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripsApi } from '@/services/api';
import { Interest } from '@/types';
import { MapPin, Calendar, Loader2, ChevronLeft } from 'lucide-react';

const INTERESTS: Interest[] = [
  'adventure', 'beaches', 'culture', 'food', 'hiking',
  'history', 'luxury', 'nature', 'nightlife', 'photography',
  'road-trips', 'skiing', 'solo-travel', 'spirituality', 'wildlife',
];

export default function TripCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    budgetLevel: 'mid-range',
    interests: [] as Interest[],
    description: '',
    maxGroupSize: 6,
    isPublic: true,
  });

  const update = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const toggleInterest = (i: Interest) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(i)
        ? prev.interests.filter(x => x !== i)
        : [...prev.interests, i],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(form.endDate) < new Date(form.startDate)) {
      setError('End date must be after start date');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await tripsApi.create(form);
      navigate(`/trips/${data.trip._id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container py-8 max-w-2xl">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="font-display text-3xl font-bold text-slate-900 mb-1">Plan a new trip</h1>
      <p className="text-slate-500 mb-8">Share where you're going and find your travel squad.</p>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Destination */}
        <div className="ts-card p-6 space-y-5">
          <h2 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">Destination & Dates</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Where are you going?</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text" required value={form.destination}
                onChange={e => update('destination', e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ocean-500 transition"
                placeholder="e.g. Bali, Indonesia"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Start date</label>
              <input
                type="date" required value={form.startDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => update('startDate', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ocean-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">End date</label>
              <input
                type="date" required value={form.endDate}
                min={form.startDate || new Date().toISOString().split('T')[0]}
                onChange={e => update('endDate', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ocean-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="ts-card p-6 space-y-5">
          <h2 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">Trip Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Budget level</label>
              <select
                value={form.budgetLevel} onChange={e => update('budgetLevel', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ocean-500 transition bg-white"
              >
                <option value="budget">Budget</option>
                <option value="backpacker">Backpacker</option>
                <option value="mid-range">Mid-range</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Max group size</label>
              <input
                type="number" value={form.maxGroupSize} min={1} max={20}
                onChange={e => update('maxGroupSize', Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ocean-500 transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              value={form.description} onChange={e => update('description', e.target.value)}
              rows={3} maxLength={1000}
              className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ocean-500 transition resize-none"
              placeholder="What are you planning to do? Who are you looking for?"
            />
          </div>
        </div>

        {/* Interests */}
        <div className="ts-card p-6">
          <h2 className="font-semibold text-slate-900 text-sm uppercase tracking-wide mb-4">Interests</h2>
          <p className="text-sm text-slate-500 mb-4">Select what this trip involves — helps us match you with compatible travelers.</p>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map(interest => (
              <button
                type="button" key={interest}
                onClick={() => toggleInterest(interest)}
                className={`ts-badge transition-all cursor-pointer capitalize ${
                  form.interests.includes(interest)
                    ? 'bg-ocean-100 text-ocean-700 border border-ocean-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {interest.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Visibility */}
        <div className="ts-card p-5 flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-900 text-sm">Public trip</p>
            <p className="text-xs text-slate-500 mt-0.5">Allow other travelers to discover and join your trip</p>
          </div>
          <button
            type="button"
            onClick={() => update('isPublic', !form.isPublic)}
            className={`relative w-11 h-6 rounded-full transition-colors ${form.isPublic ? 'bg-ocean-500' : 'bg-slate-200'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isPublic ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full py-4 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-base"
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          Publish trip
        </button>
      </form>
    </div>
  );
}
