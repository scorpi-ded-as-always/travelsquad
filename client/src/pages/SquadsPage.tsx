import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { squadsApi } from '@/services/api';
import { Squad } from '@/types';
import { Search, Users, MapPin, Plus, Lock } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  forming: 'bg-amber-50 text-amber-600',
  confirmed: 'bg-green-50 text-green-600',
  ongoing: 'bg-blue-50 text-blue-600',
  completed: 'bg-slate-100 text-slate-500',
};

export default function SquadsPage() {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    squadsApi.getAll({ destination: debounced || undefined })
      .then(res => {
        setSquads(res.data.squads);
        setTotal(res.data.pagination.total);
      })
      .finally(() => setLoading(false));
  }, [debounced]);

  return (
    <div className="page-container py-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 mb-1">Travel squads</h1>
          <p className="text-slate-500">{total} active squads looking for members</p>
        </div>
        <Link
          to="/squads/new"
          className="hidden sm:flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Create squad
        </Link>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search squads by destination..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-ocean-500 transition"
        />
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => <div key={i} className="h-52 rounded-2xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : squads.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">👥</div>
          <p className="font-medium text-slate-700 mb-1">No squads found</p>
          <p className="text-sm text-slate-500 mb-5">Be the first to create a squad for this destination!</p>
          <Link
            to="/squads/new"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Create squad
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {squads.map((squad, i) => (
            <Link
              key={squad._id}
              to={`/squads/${squad._id}`}
              className="ts-card overflow-hidden hover:-translate-y-0.5 transition-transform duration-200"
            >
              {/* Color header */}
              <div className={`h-32 relative flex items-end p-4 bg-gradient-to-br ${
                ['from-ocean-400 to-ocean-600', 'from-rose-400 to-rose-600',
                 'from-violet-400 to-violet-600', 'from-emerald-400 to-emerald-600',
                 'from-amber-400 to-amber-600', 'from-sky-400 to-sky-600'][i % 6]
              }`}>
                {squad.coverImage && (
                  <img src={squad.coverImage} alt={squad.name} className="absolute inset-0 w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="relative flex items-center justify-between w-full">
                  <span className={`ts-badge text-xs capitalize ${STATUS_COLORS[squad.status]}`}>{squad.status}</span>
                  {squad.isPrivate && <Lock className="w-3.5 h-3.5 text-white/70" />}
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-display text-lg font-semibold text-slate-900 mb-1 truncate">{squad.name}</h3>
                <p className="text-sm text-slate-500 flex items-center gap-1 mb-3">
                  <MapPin className="w-3.5 h-3.5" /> {squad.destination}
                </p>

                {squad.description && (
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4">{squad.description}</p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex -space-x-2">
                    {(squad.members as any[]).slice(0, 5).map((m, mi) => (
                      <div key={mi} className="w-7 h-7 rounded-full border-2 border-white bg-ocean-100 flex items-center justify-center text-ocean-600 text-xs font-bold overflow-hidden">
                        {m.profilePhoto
                          ? <img src={m.profilePhoto} alt={m.name} className="w-full h-full object-cover" />
                          : m.name?.[0]?.toUpperCase()
                        }
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {squad.members.length}/{squad.maxMembers}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
