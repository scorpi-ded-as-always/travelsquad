import { Link } from 'react-router-dom';
import { Compass, Users, Zap, Map, ArrowRight, Star, Globe } from 'lucide-react';

const DESTINATIONS = [
  { city: 'Bali', country: 'Indonesia', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80', travelers: 142 },
  { city: 'Tokyo', country: 'Japan', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80', travelers: 89 },
  { city: 'Santorini', country: 'Greece', img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&q=80', travelers: 67 },
  { city: 'Patagonia', country: 'Argentina', img: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=80', travelers: 34 },
];

const FEATURES = [
  {
    icon: Zap,
    title: 'Smart Matching',
    desc: 'Our algorithm matches you with travelers who share your destination, dates, budget, and interests.',
    color: 'bg-sand-100 text-amber-600',
  },
  {
    icon: Users,
    title: 'Form Squads',
    desc: 'Create or join travel squads with up to 20 people. Manage join requests and build your crew.',
    color: 'bg-ocean-50 text-ocean-600',
  },
  {
    icon: Map,
    title: 'Plan Together',
    desc: 'Collaborate on itineraries in real time. Every member can add activities day by day.',
    color: 'bg-rose-50 text-rose-500',
  },
  {
    icon: Globe,
    title: 'Real-Time Chat',
    desc: 'Stay connected with your squad via live chat rooms. See who\'s typing, get instant notifications.',
    color: 'bg-emerald-50 text-emerald-600',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg ts-gradient-hero flex items-center justify-center">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-slate-900">TravelSquad</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Sign in
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-24 pb-20 overflow-hidden ts-gradient-hero min-h-[92vh] flex items-center">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-80 h-80 rounded-full bg-coral-500/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-sky-400/5 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 px-3 py-1.5 rounded-full text-sm font-medium mb-6 border border-white/20">
              <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              Join 12,000+ travelers worldwide
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Travel with
              <br />
              <span className="italic text-sky-200">your tribe.</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/70 mb-10 leading-relaxed max-w-lg">
              Find compatible travelers going to the same destination. Form squads, chat in real time, and plan unforgettable trips — together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 font-semibold px-8 py-4 rounded-xl hover:bg-slate-50 transition-colors text-base"
              >
                Start exploring free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/explore"
                className="inline-flex items-center justify-center gap-2 bg-white/10 text-white border border-white/20 font-medium px-8 py-4 rounded-xl hover:bg-white/20 transition-colors text-base"
              >
                Browse trips
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-12 pt-8 border-t border-white/10">
              {[['12K+', 'Travelers'], ['3K+', 'Squads formed'], ['80+', 'Destinations']].map(([n, l]) => (
                <div key={l}>
                  <div className="font-display text-2xl font-bold text-white">{n}</div>
                  <div className="text-sm text-white/60">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Destination cards */}
          <div className="hidden lg:grid grid-cols-2 gap-4">
            {DESTINATIONS.map((d, i) => (
              <div
                key={d.city}
                className={`relative rounded-2xl overflow-hidden group cursor-pointer ${i === 1 ? 'mt-8' : ''}`}
                style={{ aspectRatio: '4/5' }}
              >
                <img
                  src={d.img}
                  alt={d.city}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="font-display text-lg font-semibold text-white">{d.city}</p>
                  <p className="text-sm text-white/70">{d.country}</p>
                  <div className="mt-2 inline-flex items-center gap-1 bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                    <Users className="w-3 h-3" />
                    {d.travelers} travelers
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Everything you need to
              <span className="italic"> travel smarter</span>
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              TravelSquad brings together all the tools to find your perfect travel companions and plan extraordinary trips.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-border hover:shadow-md transition-shadow">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display text-lg font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
            Your next adventure is
            <span className="italic text-ocean-500"> one squad away.</span>
          </h2>
          <p className="text-lg text-slate-500 mb-10">
            Join thousands of travelers who found their perfect travel crew on TravelSquad.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-slate-900 text-white font-semibold px-10 py-4 rounded-xl hover:bg-slate-700 transition-colors text-lg"
          >
            Create free account
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-slate-50">
        <div className="max-w-7xl mx-auto px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md ts-gradient-hero flex items-center justify-center">
              <Compass className="w-3 h-3 text-white" />
            </div>
            <span className="font-display font-bold text-slate-700">TravelSquad</span>
          </div>
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} TravelSquad. Built for explorers.</p>
        </div>
      </footer>
    </div>
  );
}
