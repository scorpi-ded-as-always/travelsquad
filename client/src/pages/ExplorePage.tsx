import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { tripsApi } from '@/services/api';
import { Trip } from '@/types';
import { Search, MapPin, Calendar, Users, Filter } from 'lucide-react';
import { format } from 'date-fns';

const BUDGET_COLORS: Record<string, string> = {
  budget: 'bg-green-50 text-green-600',
  backpacker: 'bg-lime-50 text-lime-600',
  'mid-range': 'bg-blue-50 text-blue-600',
  luxury: 'bg-purple-50 text-purple-600',
};

export default function ExplorePage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    tripsApi.getAll({ destination: debouncedSearch || undefined })
      .then(res => {
        setTrips(res.data.trips);
        setTotal(res.data.pagination.total);
      })
      .finally(() => setLoading(false));
  }, [debouncedSearch]);

  return (
    <div className="page-container py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-1">Explore trips</h1>
        <p className="text-slate-500">{total} upcoming trips from travelers worldwide</p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by destination..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-ocean-500 transition"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <p className="font-medium text-slate-700 mb-1">No trips found</p>
          <p className="text-sm text-slate-500">Try a different destination or{' '}
            <Link to="/trips/new" className="text-ocean-600 hover:underline">create your own trip</Link>
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip, i) => (
            <Link
              key={trip._id}
              to={`/trips/${trip._id}`}
              className="ts-card overflow-hidden group hover:-translate-y-0.5 transition-transform duration-200"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Cover */}
              <div className="h-44 bg-gradient-to-br from-ocean-400 to-ocean-700 relative overflow-hidden">
                {trip.coverImage ? (
                  <img src={trip.coverImage} alt={trip.destination} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">
                    {['🏝️', '🏔️', '🌆', '🏜️', '🌊', '🗼'][i % 6]}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <span className={`ts-badge text-xs capitalize ${BUDGET_COLORS[trip.budgetLevel] || 'bg-slate-100 text-slate-600'}`}>
                    {trip.budgetLevel}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-display text-lg font-semibold text-slate-900 leading-tight">{trip.destination}</h3>
                  <span className={`ts-badge shrink-0 text-xs ${
                    trip.status === 'planning' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                  }`}>{trip.status}</span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(trip.startDate), 'MMM d')} – {format(new Date(trip.endDate), 'MMM d')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Up to {trip.maxGroupSize}
                  </span>
                </div>

                {trip.description && (
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4">{trip.description}</p>
                )}

                {/* Creator */}
                <div className="flex items-center gap-2 pt-3 border-t border-border">
                  {trip.creator?.profilePhoto ? (
                    <img src={trip.creator.profilePhoto} alt={trip.creator.name} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-ocean-100 flex items-center justify-center text-ocean-600 text-xs font-bold">
                      {trip.creator?.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs text-slate-600 font-medium">{trip.creator?.name}</span>
                  {trip.creator?.homeCity && (
                    <span className="text-xs text-slate-400 flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5" />{trip.creator.homeCity}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
