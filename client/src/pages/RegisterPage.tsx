import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/hooks/useAuthStore';
import { Compass, Loader2 } from 'lucide-react';
import { Interest } from '@/types';

const INTERESTS: Interest[] = [
  'adventure', 'beaches', 'culture', 'food', 'hiking',
  'history', 'luxury', 'nature', 'nightlife', 'photography',
  'road-trips', 'skiing', 'solo-travel', 'spirituality', 'wildlife',
];

const INTEREST_EMOJI: Record<Interest, string> = {
  adventure: '🧗', beaches: '🏖️', culture: '🎭', food: '🍜', hiking: '🥾',
  history: '🏛️', luxury: '✨', nature: '🌿', nightlife: '🎵', photography: '📷',
  'road-trips': '🚗', skiing: '⛷️', 'solo-travel': '🎒', spirituality: '🧘', wildlife: '🦁',
};

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', password: '', bio: '', homeCity: '',
    interests: [] as Interest[], travelStyle: 'mid-range',
  });
  const [error, setError] = useState('');
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

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
    setError('');
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
      setStep(1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded-lg ts-gradient-hero flex items-center justify-center">
            <Compass className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-xl font-bold text-slate-900">TravelSquad</span>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step >= s ? 'bg-ocean-500 text-white' : 'bg-slate-100 text-slate-400'
                }`}>{s}</div>
                <span className={`text-xs font-medium ${step >= s ? 'text-slate-700' : 'text-slate-400'}`}>
                  {s === 1 ? 'Account' : 'Preferences'}
                </span>
                {s < 2 && <div className={`flex-1 h-px ${step > s ? 'bg-ocean-500' : 'bg-slate-200'}`} />}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4 animate-in">
                <h2 className="font-display text-2xl font-bold text-slate-900 mb-1">Create your account</h2>
                <p className="text-slate-500 text-sm mb-5">Join thousands of travelers finding their perfect crew.</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Full name</label>
                    <input
                      type="text" required value={form.name} onChange={e => update('name', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ocean-500 transition text-sm"
                      placeholder="Alex Chen"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                    <input
                      type="email" required value={form.email} onChange={e => update('email', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ocean-500 transition text-sm"
                      placeholder="alex@example.com"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                    <input
                      type="password" required minLength={6} value={form.password} onChange={e => update('password', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ocean-500 transition text-sm"
                      placeholder="Min. 6 characters"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Home city</label>
                    <input
                      type="text" value={form.homeCity} onChange={e => update('homeCity', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ocean-500 transition text-sm"
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Travel style</label>
                    <select
                      value={form.travelStyle} onChange={e => update('travelStyle', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ocean-500 transition text-sm bg-white"
                    >
                      <option value="budget">Budget</option>
                      <option value="backpacker">Backpacker</option>
                      <option value="mid-range">Mid-range</option>
                      <option value="luxury">Luxury</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button" onClick={() => setStep(2)}
                  disabled={!form.name || !form.email || !form.password}
                  className="w-full mt-2 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in">
                <h2 className="font-display text-2xl font-bold text-slate-900 mb-1">Your travel interests</h2>
                <p className="text-slate-500 text-sm mb-6">Select what excites you. We'll match you with like-minded travelers.</p>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio (optional)</label>
                  <textarea
                    value={form.bio} onChange={e => update('bio', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ocean-500 transition text-sm resize-none"
                    placeholder="Tell fellow travelers a little about yourself..."
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 mb-6">
                  {INTERESTS.map(interest => (
                    <button
                      type="button" key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                        form.interests.includes(interest)
                          ? 'bg-ocean-50 border-ocean-200 text-ocean-700'
                          : 'border-border text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span>{INTEREST_EMOJI[interest]}</span>
                      <span className="capitalize">{interest.replace('-', ' ')}</span>
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button" onClick={() => setStep(1)}
                    className="flex-1 py-3 rounded-xl border border-border text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit" disabled={isLoading}
                    className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Create account
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-ocean-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
