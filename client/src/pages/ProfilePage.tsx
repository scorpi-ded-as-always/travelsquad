import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/hooks/useAuthStore';
import { usersApi, tripsApi } from '@/services/api';
import { User, Trip } from '@/types';
import { MapPin, Edit3, Save, X, Loader2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Interest } from '@/types';

const INTERESTS: Interest[] = [
  'adventure', 'beaches', 'culture', 'food', 'hiking',
  'history', 'luxury', 'nature', 'nightlife', 'photography',
  'road-trips', 'skiing', 'solo-travel', 'spirituality', 'wildlife',
];

const INTEREST_EMOJI: Record<string, string> = {
  adventure: '🧗', beaches: '🏖️', culture: '🎭', food: '🍜', hiking: '🥾',
  history: '🏛️', luxury: '✨', nature: '🌿', nightlife: '🎵', photography: '📷',
  'road-trips': '🚗', skiing: '⛷️', 'solo-travel': '🎒', spirituality: '🧘', wildlife: '🦁',
};

export default function ProfilePage() {
  const { id } = useParams<{ id?: string }>();
  const { user: authUser, updateUser } = useAuthStore();
  const navigate = useNavigate();

  const isOwnProfile = !id || id === authUser?._id;
  const [profile, setProfile] = useState<User | null>(isOwnProfile ? authUser : null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(!isOwnProfile);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '', bio: '', homeCity: '', interests: [] as Interest[], travelStyle: 'mid-range',
  });

  useEffect(() => {
    if (!isOwnProfile && id) {
      usersApi.getById(id).then(res => setProfile(res.data.user)).finally(() => setLoading(false));
    } else if (isOwnProfile && authUser) {
      setProfile(authUser);
      tripsApi.getMine().then(res => setTrips(res.data.trips.slice(0, 6)));
    }
  }, [id, isOwnProfile, authUser]);

  const startEdit = () => {
    if (!profile) return;
    setEditForm({
      name: profile.name,
      bio: profile.bio || '',
      homeCity: profile.homeCity || '',
      interests: (profile.interests || []) as Interest[],
      travelStyle: profile.travelStyle || 'mid-range',
    });
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const saveEdit = async () => {
    setSaving(true);
    try {
      const { data } = await usersApi.updateProfile(editForm);
      setProfile(data.user);
      updateUser(data.user);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const toggleInterest = (i: Interest) => {
    setEditForm(prev => ({
      ...prev,
      interests: prev.interests.includes(i)
        ? prev.interests.filter(x => x !== i)
        : [...prev.interests, i],
    }));
  };

  if (loading) return (
    <div className="page-container py-12">
      <div className="h-36 rounded-2xl bg-slate-100 animate-pulse mb-6" />
      <div className="h-6 w-1/4 rounded bg-slate-100 animate-pulse" />
    </div>
  );

  if (!profile) return (
    <div className="page-container py-20 text-center">
      <p className="text-slate-500">User not found.</p>
    </div>
  );

  return (
    <div className="page-container py-8 max-w-3xl">
      {/* Profile header */}
      <div className="ts-card p-6 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-ocean-100 flex items-center justify-center text-ocean-600 text-3xl font-bold overflow-hidden shrink-0">
              {profile.profilePhoto
                ? <img src={profile.profilePhoto} alt={profile.name} className="w-full h-full object-cover" />
                : profile.name?.[0]?.toUpperCase()
              }
            </div>
            <div>
              {editing ? (
                <input
                  value={editForm.name}
                  onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                  className="font-display text-2xl font-bold border-b-2 border-ocean-400 focus:outline-none bg-transparent text-slate-900 w-full"
                />
              ) : (
                <h1 className="font-display text-2xl font-bold text-slate-900">{profile.name}</h1>
              )}
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {editing ? (
                  <input
                    value={editForm.homeCity}
                    onChange={e => setEditForm(p => ({ ...p, homeCity: e.target.value }))}
                    className="text-sm border-b border-slate-300 focus:outline-none focus:border-ocean-400 text-slate-500 bg-transparent"
                    placeholder="Home city"
                  />
                ) : (
                  profile.homeCity && (
                    <span className="text-sm text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {profile.homeCity}
                    </span>
                  )
                )}
                {!editing && (
                  <span className="ts-badge bg-slate-100 text-slate-600 capitalize">
                    {profile.travelStyle}
                  </span>
                )}
              </div>
            </div>
          </div>

          {isOwnProfile && (
            <div className="flex gap-2">
              {editing ? (
                <>
                  <button onClick={cancelEdit} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-slate-600 text-sm hover:bg-slate-50 transition-colors">
                    <X className="w-4 h-4" /> Cancel
                  </button>
                  <button onClick={saveEdit} disabled={saving} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white text-sm hover:bg-slate-700 transition-colors disabled:opacity-60">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save
                  </button>
                </>
              ) : (
                <button onClick={startEdit} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-slate-600 text-sm hover:bg-slate-50 transition-colors">
                  <Edit3 className="w-4 h-4" /> Edit profile
                </button>
              )}
            </div>
          )}
        </div>

        {/* Bio */}
        <div className="mt-5">
          {editing ? (
            <textarea
              value={editForm.bio}
              onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))}
              rows={3} maxLength={500}
              className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ocean-500 transition resize-none text-sm"
              placeholder="Tell travelers about yourself..."
            />
          ) : (
            profile.bio ? (
              <p className="text-slate-600 leading-relaxed">{profile.bio}</p>
            ) : isOwnProfile ? (
              <p className="text-slate-400 italic text-sm">Add a bio to let other travelers know who you are.</p>
            ) : null
          )}
        </div>

        {/* Interests */}
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Interests</p>
          {editing ? (
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(interest => (
                <button
                  type="button" key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`ts-badge cursor-pointer capitalize transition-all ${
                    editForm.interests.includes(interest)
                      ? 'bg-ocean-100 text-ocean-700 border border-ocean-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {INTEREST_EMOJI[interest]} {interest.replace('-', ' ')}
                </button>
              ))}
            </div>
          ) : (
            profile.interests?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.interests.map(i => (
                  <span key={i} className="ts-interest-tag capitalize">
                    {INTEREST_EMOJI[i]} {i.replace('-', ' ')}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm italic">No interests added.</p>
            )
          )}
        </div>

        {editing && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Travel style</p>
            <select
              value={editForm.travelStyle}
              onChange={e => setEditForm(p => ({ ...p, travelStyle: e.target.value }))}
              className="px-4 py-2 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ocean-500 transition bg-white text-sm"
            >
              <option value="budget">Budget</option>
              <option value="backpacker">Backpacker</option>
              <option value="mid-range">Mid-range</option>
              <option value="luxury">Luxury</option>
            </select>
          </div>
        )}
      </div>

      {/* Trips (own profile) */}
      {isOwnProfile && trips.length > 0 && (
        <div>
          <h2 className="font-display text-xl font-semibold text-slate-900 mb-4">My trips</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {trips.map(trip => (
              <a key={trip._id} href={`/trips/${trip._id}`} className="ts-card p-4 hover:border-ocean-200 transition-colors">
                <p className="font-semibold text-slate-900">{trip.destination}</p>
                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(trip.startDate), 'MMM d')} – {format(new Date(trip.endDate), 'MMM d, yyyy')}
                </p>
                <span className={`mt-2 ts-badge capitalize text-xs ${
                  trip.status === 'planning' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                }`}>{trip.status}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
