import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { tripsApi } from '@/services/api';
import { Trip } from '@/types';
import { Zap, MapPin, Calendar, Users, Star } from 'lucide-react';
import { format } from 'date-fns';

export default function MatchesPage() {
  const [matches, setMatches] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tripsApi.getMatches()
      .then(res => setMatches(res.data.matches))
      .finally(() => setLoading(false));
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-50';
    if (score >= 40) return 'text-amber-600 bg-amber-50';
    return 'text-slate-600 bg-slate-100';
  };

  return (
    <div className="page-container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl ts-gradient-coral flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Your matches</h1>
        </div>
        <p className="text-slate-500">Travelers matched to you based on destination, dates, interests, and budget.</p>
      </div>

      {/* How matching works */}
      <div className="ts-card p-5 mb-8 bg-slate-50 border-slate-200">
        <h2 className="font-semibold text-slate-900 mb-3 text-sm">How matching works</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Destination', weight: '40%', icon: '📍' },
            { label: 'Date overlap', weight: '30%', icon: '📅' },
            { label: 'Interests', weight: '20%', icon: '⭐' },
            { label: 'Budget', weight: '10%', icon: '💰' },
          ].map(({ label, weight, icon }) => (
            <div key={label} className="bg-white rounded-xl p-3 text-center border border-border">
              <div className="text-xl mb-1">{icon}</div>
              <div className="font-semibold text-slate-900 text-sm">{weight}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array(5).fill(0).map((_, i) => <div key={i} className="h-36 rounded-2xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-20 ts-card">
          <div className="text-5xl mb-4">🔍</div>
          <p className="font-medium text-slate-700 mb-1">No matches yet</p>
          <p className="text-sm text-slate-500 mb-5">Create a trip first so we can find your best travel companions!</p>
          <Link to="/trips/new" className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium">
            Plan a trip
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((trip, rank) => (
            <div key={trip._id} className="ts-card p-5 flex gap-5 items-start hover:border-ocean-200 transition-colors">
              {/* Rank */}
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 shrink-0">
                #{rank + 1}
              </div>

              {/* Creator avatar */}
              <div className="w-12 h-12 rounded-full bg-ocean-100 flex items-center justify-center text-ocean-600 font-bold text-lg overflow-hidden shrink-0">
                {(trip.creator as any)?.profilePhoto
                  ? <img src={(trip.creator as any).profilePhoto} alt={(trip.creator as any).name} className="w-full h-full object-cover" />
                  : (trip.creator as any)?.name?.[0]?.toUpperCase()
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <Link to={`/profile/${(trip.creator as any)?._id}`} className="font-semibold text-slate-900 hover:text-ocean-600 transition-colors">
                      {(trip.creator as any)?.name}
                    </Link>
                    <p className="text-sm text-slate-500">{(trip.creator as any)?.homeCity}</p>
                  </div>
                  {trip.matchScore !== undefined && (
                    <span className={`ts-badge font-semibold text-xs ${getScoreColor(trip.matchScore)}`}>
                      <Star className="w-3 h-3 fill-current" />
                      {trip.matchScore}% match
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-ocean-500" />
                    {trip.destination}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-ocean-500" />
                    {format(new Date(trip.startDate), 'MMM d')} – {format(new Date(trip.endDate), 'MMM d, yyyy')}
                  </span>
                  <span className="flex items-center gap-1.5 capitalize">
                    <span className="w-2 h-2 rounded-full bg-ocean-400" />
                    {trip.budgetLevel}
                  </span>
                </div>

                {(trip.creator as any)?.interests?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {(trip.creator as any).interests.slice(0, 5).map((i: string) => (
                      <span key={i} className="ts-interest-tag capitalize">{i.replace('-', ' ')}</span>
                    ))}
                  </div>
                )}

                {(trip.creator as any)?.bio && (
                  <p className="text-sm text-slate-500 mt-2 line-clamp-1 italic">"{(trip.creator as any).bio}"</p>
                )}
              </div>

              {/* CTA */}
              <div className="flex flex-col gap-2 shrink-0">
                <Link
                  to={`/profile/${(trip.creator as any)?._id}`}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-700 transition-colors text-center"
                >
                  View profile
                </Link>
                <Link
                  to={`/trips/${trip._id}`}
                  className="px-4 py-2 rounded-xl border border-border text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors text-center"
                >
                  View trip
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
