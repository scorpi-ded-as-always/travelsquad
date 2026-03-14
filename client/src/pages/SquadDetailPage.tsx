import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { squadsApi } from '@/services/api';
import { Squad, ItineraryItem } from '@/types';
import { useAuthStore } from '@/hooks/useAuthStore';
import { MessageSquare, MapPin, Users, Plus, Trash2, ArrowLeft, UserPlus, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function SquadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [squad, setSquad] = useState<Squad | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'members' | 'requests'>('overview');
  const [joiningMsg, setJoiningMsg] = useState('');
  const [joining, setJoining] = useState(false);
  const [newActivity, setNewActivity] = useState({ day: 1, activity: '', location: '', notes: '', time: '' });
  const [addingActivity, setAddingActivity] = useState(false);

  useEffect(() => {
    if (!id) return;
    squadsApi.getById(id).then(res => setSquad(res.data.squad)).finally(() => setLoading(false));
  }, [id]);

  const isMember = squad?.members.some((m: any) => m._id === user?._id || m === user?._id);
  const isCreator = (squad?.creator as any)?._id === user?._id || squad?.creator === user?._id;
  const hasPendingRequest = squad?.joinRequests.some(r => (r.user as any)?._id === user?._id && r.status === 'pending');

  const handleJoin = async () => {
    if (!id) return;
    setJoining(true);
    try {
      const res = await squadsApi.requestJoin(id, joiningMsg);
      setSquad(res.data.squad);
      setJoiningMsg('');
    } finally {
      setJoining(false);
    }
  };

  const handleRequest = async (requestId: string, action: 'approved' | 'rejected') => {
    if (!id) return;
    const res = await squadsApi.handleJoinRequest(id, requestId, action);
    setSquad(res.data.squad);
  };

  const handleAddActivity = async () => {
    if (!id || !newActivity.activity.trim()) return;
    setAddingActivity(true);
    try {
      const res = await squadsApi.addItinerary(id, newActivity);
      setSquad(res.data.squad);
      setNewActivity({ day: 1, activity: '', location: '', notes: '', time: '' });
    } finally {
      setAddingActivity(false);
    }
  };

  const handleRemoveActivity = async (itemId: string) => {
    if (!id) return;
    const res = await squadsApi.removeItinerary(id, itemId);
    setSquad(res.data.squad);
  };

  if (loading) return (
    <div className="page-container py-12">
      <div className="h-48 rounded-2xl bg-slate-100 animate-pulse mb-6" />
      <div className="h-6 w-1/3 rounded bg-slate-100 animate-pulse mb-3" />
    </div>
  );

  if (!squad) return (
    <div className="page-container py-20 text-center">
      <p className="text-slate-500">Squad not found.</p>
    </div>
  );

  const groupedItinerary = squad.itinerary.reduce((acc: Record<number, ItineraryItem[]>, item) => {
    if (!acc[item.day]) acc[item.day] = [];
    acc[item.day].push(item);
    return acc;
  }, {});

  return (
    <div className="page-container py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div className="ts-card overflow-hidden mb-6">
        <div className="h-40 bg-gradient-to-br from-ocean-400 to-ocean-700 relative">
          {squad.coverImage && <img src={squad.coverImage} alt={squad.name} className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-900">{squad.name}</h1>
              <p className="text-slate-500 flex items-center gap-1 mt-1"><MapPin className="w-3.5 h-3.5" />{squad.destination}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {isMember && (
                <Link
                  to={`/squads/${squad._id}/chat`}
                  className="flex items-center gap-2 bg-ocean-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-ocean-600 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" /> Open chat
                </Link>
              )}
              {!isMember && !hasPendingRequest && (
                <div className="flex items-center gap-2">
                  <input
                    value={joiningMsg}
                    onChange={e => setJoiningMsg(e.target.value)}
                    placeholder="Optional message..."
                    className="px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                  />
                  <button
                    onClick={handleJoin}
                    disabled={joining}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-60"
                  >
                    {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    Request to join
                  </button>
                </div>
              )}
              {hasPendingRequest && (
                <span className="ts-badge bg-amber-50 text-amber-600 px-3 py-1.5">Request pending</span>
              )}
            </div>
          </div>

          {/* Members preview */}
          <div className="flex items-center gap-3 mt-5 pt-5 border-t border-border">
            <div className="flex -space-x-2">
              {(squad.members as any[]).slice(0, 6).map((m, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-ocean-100 flex items-center justify-center text-ocean-600 text-xs font-bold overflow-hidden">
                  {m.profilePhoto ? <img src={m.profilePhoto} alt={m.name} className="w-full h-full object-cover" /> : m.name?.[0]?.toUpperCase()}
                </div>
              ))}
            </div>
            <span className="text-sm text-slate-600">{squad.members.length}/{squad.maxMembers} members</span>
            {isCreator && squad.joinRequests.filter(r => r.status === 'pending').length > 0 && (
              <span className="ts-badge bg-rose-50 text-rose-600 ml-auto">
                {squad.joinRequests.filter(r => r.status === 'pending').length} pending request(s)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit">
        {(['overview', 'itinerary', 'members', ...(isCreator ? ['requests'] : [])] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
            {tab === 'requests' && squad.joinRequests.filter(r => r.status === 'pending').length > 0 && (
              <span className="ml-1.5 bg-rose-500 text-white text-xs rounded-full px-1.5">{squad.joinRequests.filter(r => r.status === 'pending').length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="ts-card p-6">
          {squad.description ? (
            <p className="text-slate-600 leading-relaxed">{squad.description}</p>
          ) : (
            <p className="text-slate-400 italic">No description provided.</p>
          )}
        </div>
      )}

      {activeTab === 'itinerary' && (
        <div className="space-y-6">
          {isMember && (
            <div className="ts-card p-5">
              <h3 className="font-semibold text-slate-900 mb-4">Add activity</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Day</label>
                  <input
                    type="number" min={1} value={newActivity.day}
                    onChange={e => setNewActivity(p => ({ ...p, day: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs text-slate-500 mb-1 block">Time</label>
                  <input
                    type="time" value={newActivity.time}
                    onChange={e => setNewActivity(p => ({ ...p, time: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-500 mb-1 block">Activity *</label>
                  <input
                    type="text" value={newActivity.activity} placeholder="e.g. Visit Tanah Lot Temple"
                    onChange={e => setNewActivity(p => ({ ...p, activity: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-500 mb-1 block">Location</label>
                  <input
                    type="text" value={newActivity.location} placeholder="e.g. Ubud, Bali"
                    onChange={e => setNewActivity(p => ({ ...p, location: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                  />
                </div>
                <div className="col-span-2 flex items-end">
                  <button
                    onClick={handleAddActivity} disabled={addingActivity || !newActivity.activity.trim()}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors"
                  >
                    {addingActivity ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {Object.keys(groupedItinerary).length === 0 ? (
            <div className="ts-card p-10 text-center">
              <div className="text-4xl mb-3">🗓️</div>
              <p className="text-slate-500">No activities planned yet. {isMember ? 'Be the first to add one!' : ''}</p>
            </div>
          ) : (
            Object.entries(groupedItinerary).sort(([a], [b]) => Number(a) - Number(b)).map(([day, items]) => (
              <div key={day}>
                <h3 className="font-display font-semibold text-slate-900 mb-3">Day {day}</h3>
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item._id} className="ts-card p-4 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-ocean-50 flex items-center justify-center text-ocean-500 text-xs font-mono shrink-0 mt-0.5">
                        {item.time || '—'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900">{item.activity}</p>
                        {item.location && <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{item.location}</p>}
                        {item.notes && <p className="text-sm text-slate-400 mt-1 italic">{item.notes}</p>}
                        <p className="text-xs text-slate-400 mt-1">Added by {(item.addedBy as any)?.name}</p>
                      </div>
                      {((item.addedBy as any)?._id === user?._id || isCreator) && (
                        <button onClick={() => handleRemoveActivity(item._id)} className="text-slate-300 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'members' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(squad.members as any[]).map(member => (
            <Link key={member._id} to={`/profile/${member._id}`} className="ts-card p-4 flex items-center gap-3 hover:border-ocean-200 transition-colors">
              <div className="w-11 h-11 rounded-full bg-ocean-100 flex items-center justify-center text-ocean-600 font-bold overflow-hidden shrink-0">
                {member.profilePhoto ? <img src={member.profilePhoto} alt={member.name} className="w-full h-full object-cover" /> : member.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 truncate">{member.name}</p>
                <p className="text-xs text-slate-500 truncate">{member.homeCity}</p>
              </div>
              {(squad.creator as any)?._id === member._id && (
                <span className="ml-auto ts-badge bg-ocean-50 text-ocean-600 text-xs shrink-0">Creator</span>
              )}
            </Link>
          ))}
        </div>
      )}

      {activeTab === 'requests' && isCreator && (
        <div className="space-y-4">
          {squad.joinRequests.filter(r => r.status === 'pending').length === 0 ? (
            <div className="ts-card p-10 text-center">
              <p className="text-slate-500">No pending join requests.</p>
            </div>
          ) : (
            squad.joinRequests.filter(r => r.status === 'pending').map(req => (
              <div key={req._id} className="ts-card p-5 flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-ocean-100 flex items-center justify-center text-ocean-600 font-bold overflow-hidden shrink-0">
                  {(req.user as any)?.profilePhoto
                    ? <img src={(req.user as any).profilePhoto} alt={(req.user as any).name} className="w-full h-full object-cover" />
                    : (req.user as any)?.name?.[0]?.toUpperCase()
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900">{(req.user as any)?.name}</p>
                  <p className="text-xs text-slate-500">{(req.user as any)?.homeCity}</p>
                  {req.message && <p className="text-sm text-slate-600 mt-2 italic">"{req.message}"</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleRequest(req._id, 'approved')} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors">
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  <button onClick={() => handleRequest(req._id, 'rejected')} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                    <XCircle className="w-4 h-4" /> Decline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
