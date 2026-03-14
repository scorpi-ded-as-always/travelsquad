import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/hooks/useAuthStore';
import { tripsApi, squadsApi } from '@/services/api';
import { Trip, Squad } from '@/types';
import { MapPin, Calendar, Users, Plus, ArrowRight, Zap } from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [myTrips, setMyTrips] = useState<Trip[]>([]);
  const [mySquads, setMySquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([tripsApi.getMine(), squadsApi.getMine()])
      .then(([tripsRes, squadsRes]) => {
        setMyTrips(tripsRes.data.trips.slice(0, 3));
        setMySquads(squadsRes.data.squads.slice(0, 4));
      })
      .finally(() => setLoading(false));
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="page-container py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">
            {greeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 mt-1">Ready for your next adventure?</p>
        </div>
        <Link
          to="/trips/new"
          className="hidden sm:flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Plan a trip
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Trips planned', value: myTrips.length, icon: '🗺️' },
          { label: 'Squads', value: mySquads.length, icon: '👥' },
          { label: 'Interests', value: user?.interests?.length || 0, icon: '⭐' },
          { label: 'Travel style', value: user?.travelStyle || '—', icon: '🎒' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="ts-card p-5">
            <div className="text-2xl mb-2">{icon}</div>
            <div className="font-display text-xl font-bold text-slate-900">{value}</div>
            <div className="text-xs text-slate-500 mt-0.5 capitalize">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* My Trips */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-semibold text-slate-900">My trips</h2>
            <Link to="/explore" className="text-sm text-ocean-600 hover:underline flex items-center gap-1">
              Explore <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />)}
            </div>
          ) : myTrips.length === 0 ? (
            <div className="ts-card p-10 text-center">
              <div className="text-4xl mb-3">✈️</div>
              <p className="font-medium text-slate-700 mb-1">No trips yet</p>
              <p className="text-sm text-slate-500 mb-5">Start planning your first adventure!</p>
              <Link to="/trips/new" className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium">
                <Plus className="w-4 h-4" /> Plan a trip
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myTrips.map(trip => (
                <Link
                  key={trip._id}
                  to={`/trips/${trip._id}`}
                  className="ts-card p-5 flex items-center gap-4 hover:border-ocean-200 transition-colors block"
                >
                  <div className="w-12 h-12 rounded-xl bg-ocean-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-ocean-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{trip.destination}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(trip.startDate), 'MMM d')} – {format(new Date(trip.endDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  <span className={`ts-badge text-xs ${
                    trip.status === 'planning' ? 'bg-amber-50 text-amber-600' :
                    trip.status === 'confirmed' ? 'bg-green-50 text-green-600' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {trip.status}
                  </span>
                </Link>
              ))}
              <Link to="/explore" className="ts-card p-4 text-center text-sm text-ocean-600 hover:bg-ocean-50 transition-colors block font-medium">
                View all trips →
              </Link>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Match CTA */}
          <div className="rounded-2xl ts-gradient-coral p-6 text-white">
            <Zap className="w-6 h-6 mb-3 text-white" />
            <h3 className="font-display text-lg font-semibold mb-1">Find your matches</h3>
            <p className="text-sm text-white/80 mb-4">Discover travelers going to the same destination as you.</p>
            <Link
              to="/matches"
              className="inline-flex items-center gap-2 bg-white text-rose-500 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-rose-50 transition-colors"
            >
              View matches <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* My Squads */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-slate-900">My squads</h2>
              <Link to="/squads" className="text-sm text-ocean-600 hover:underline">View all</Link>
            </div>
            {mySquads.length === 0 ? (
              <div className="ts-card p-6 text-center">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Join or create a squad to start planning together.</p>
                <Link to="/squads" className="text-sm text-ocean-600 font-medium hover:underline mt-2 inline-block">
                  Browse squads
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {mySquads.map(squad => (
                  <Link
                    key={squad._id}
                    to={`/squads/${squad._id}`}
                    className="ts-card p-4 flex items-center gap-3 hover:border-ocean-200 transition-colors block"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-ocean-400 to-ocean-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {squad.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{squad.name}</p>
                      <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" /> {squad.destination}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400">
                      {squad.members.length}/{squad.maxMembers}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
