import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { tripsApi } from '@/services/api';
import { Trip } from '@/types';
import { useAuthStore } from '@/hooks/useAuthStore';
import { MapPin, Calendar, Users, ArrowLeft, Trash2, Edit, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    tripsApi.getById(id)
      .then(res => setTrip(res.data.trip))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!id || !confirm('Delete this trip?')) return;
    await tripsApi.delete(id);
    navigate('/explore');
  };

  if (loading) return (
    <div className="page-container py-12">
      <div className="h-64 rounded-2xl bg-slate-100 animate-pulse mb-6" />
      <div className="h-8 w-1/3 rounded bg-slate-100 animate-pulse mb-3" />
      <div className="h-4 w-2/3 rounded bg-slate-100 animate-pulse" />
    </div>
  );

  if (!trip) return (
    <div className="page-container py-20 text-center">
      <p className="text-slate-500">Trip not found.</p>
      <Link to="/explore" className="text-ocean-600 hover:underline mt-2 inline-block">Back to explore</Link>
    </div>
  );

  const isOwner = user?._id === (trip.creator as any)?._id || user?._id === trip.creator;

  return (
    <div className="page-container py-8 max-w-3xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Hero */}
      <div className="h-56 rounded-2xl bg-gradient-to-br from-ocean-400 to-ocean-700 mb-8 relative overflow-hidden">
        {trip.coverImage && (
          <img src={trip.coverImage} alt={trip.destination} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">{trip.destination}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-white/80 text-sm flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(trip.startDate), 'MMM d')} – {format(new Date(trip.endDate), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
          {isOwner && (
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="p-2 rounded-lg bg-white/20 text-white hover:bg-red-500/80 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main */}
        <div className="md:col-span-2 space-y-6">
          {trip.description && (
            <div className="ts-card p-6">
              <h2 className="font-semibold text-slate-900 mb-3">About this trip</h2>
              <p className="text-slate-600 leading-relaxed">{trip.description}</p>
            </div>
          )}

          {trip.interests?.length > 0 && (
            <div className="ts-card p-6">
              <h2 className="font-semibold text-slate-900 mb-3">Interests</h2>
              <div className="flex flex-wrap gap-2">
                {trip.interests.map(i => (
                  <span key={i} className="ts-interest-tag capitalize">{i.replace('-', ' ')}</span>
                ))}
              </div>
            </div>
          )}

          {trip.squad && (
            <div className="ts-card p-6">
              <h2 className="font-semibold text-slate-900 mb-3">Squad</h2>
              <Link
                to={`/squads/${(trip.squad as any)._id}`}
                className="flex items-center gap-3 hover:text-ocean-600 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-ocean-500 flex items-center justify-center text-white font-bold text-sm">
                  {(trip.squad as any).name?.[0]?.toUpperCase()}
                </div>
                <span className="font-medium">{(trip.squad as any).name}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 ml-auto" />
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="ts-card p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-ocean-500" />
              <span>{trip.destination}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="w-4 h-4 text-ocean-500" />
              <span>{format(new Date(trip.startDate), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Users className="w-4 h-4 text-ocean-500" />
              <span>Up to {trip.maxGroupSize} people</span>
            </div>
            <div className="pt-2 border-t border-border">
              <span className={`ts-badge capitalize ${
                trip.budgetLevel === 'luxury' ? 'bg-purple-50 text-purple-600' :
                trip.budgetLevel === 'budget' ? 'bg-green-50 text-green-600' :
                'bg-blue-50 text-blue-600'
              }`}>{trip.budgetLevel}</span>
            </div>
          </div>

          {/* Creator card */}
          <div className="ts-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Trip creator</p>
            <Link to={`/profile/${(trip.creator as any)?._id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              {(trip.creator as any)?.profilePhoto ? (
                <img src={(trip.creator as any).profilePhoto} alt={(trip.creator as any).name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-ocean-100 flex items-center justify-center text-ocean-600 font-bold">
                  {(trip.creator as any)?.name?.[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold text-slate-900 text-sm">{(trip.creator as any)?.name}</p>
                <p className="text-xs text-slate-500">{(trip.creator as any)?.homeCity}</p>
              </div>
            </Link>
            {(trip.creator as any)?.interests?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {(trip.creator as any).interests.slice(0, 4).map((i: string) => (
                  <span key={i} className="ts-interest-tag capitalize">{i.replace('-', ' ')}</span>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/squads"
            className="block w-full text-center py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-700 transition-colors text-sm"
          >
            Find a squad for this trip
          </Link>
        </div>
      </div>
    </div>
  );
}
