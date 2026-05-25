import { useState, useEffect } from 'react';
import { Cap, SellerContact } from '../types/Cap';
import { api } from '../services/api';
import TeamLogo, { NBALogo, FacebookIcon, InstagramIcon } from './TeamLogos';
import { Search, Shield, ChevronDown, Star, Phone, Mail, MapPin, ExternalLink, Store, User, MessageCircle } from 'lucide-react';

interface Props { onAdmin: () => void; }

const COND_STYLES: Record<string, string> = {
  deadstock: 'bg-emerald-500', 'near-mint': 'bg-green-500', excellent: 'bg-blue-500',
  good: 'bg-yellow-500', fair: 'bg-orange-500', beater: 'bg-red-500',
};

export default function Showcase({ onAdmin }: Props) {
  const [caps, setCaps] = useState<Cap[]>([]);
  const [contact, setContact] = useState<SellerContact | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<Cap | null>(null);

  const loadAll = () => {
    api.getAll().then(setCaps);
    api.getContact().then(setContact);
  };

  useEffect(() => {
    loadAll();
    // Listen for storage changes to update contact info immediately if admin changes it
    window.addEventListener('focus', loadAll);
    return () => window.removeEventListener('focus', loadAll);
  }, []);

  const teams = [...new Set(caps.map(c => c.team))].sort();
  const filtered = caps.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase())
      || c.team.toLowerCase().includes(search.toLowerCase())
      || c.description.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || c.team === filter;
    return matchSearch && matchFilter;
  });
  const featured = caps.filter(c => c.featured);

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-stone-950/90 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-black text-lg uppercase tracking-wide">
              NBA <span className="text-red-500">Caps</span> Vault
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#featured" className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block">Featured</a>
            <a href="#collection" className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block">Collection</a>
            <a href="#contact" className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block">Contact</a>
            <button
              onClick={onAdmin}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-bold uppercase tracking-wider transition-colors"
            >
              <Shield size={14} /> Login
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/20 via-stone-950 to-stone-950" />
        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%"><defs><pattern id="h" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <circle cx="40" cy="40" r="30" fill="none" stroke="white" strokeWidth="1"/>
          </pattern></defs><rect width="100%" height="100%" fill="url(#h)"/></svg>
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-24 text-center">
          <h1 className="text-5xl sm:text-6xl font-black uppercase tracking-tight mb-4">
            Vintage NBA <span className="text-red-500">Cap</span> Showcase
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
            A curated collection of the rarest and most iconic NBA headwear from the golden era of basketball.
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-slate-500">
            <span><strong className="text-white text-2xl">{caps.length}</strong> Caps</span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span><strong className="text-white text-2xl">{teams.length}</strong> Teams</span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span><strong className="text-white text-2xl">₱{caps.reduce((s,c)=>s+c.price,0).toLocaleString()}</strong> Value</span>
          </div>
        </div>
      </section>

      {/* FEATURED */}
      {featured.length > 0 && (
        <section id="featured" className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center gap-3 mb-8">
            <Star size={20} className="text-red-500" />
            <h2 className="text-2xl font-black uppercase tracking-wide">Featured Pieces</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map(cap => (
              <button
                key={cap.id}
                onClick={() => setSelected(cap)}
                className="group text-left bg-gradient-to-br from-stone-900 to-stone-800 rounded-2xl border border-white/10 overflow-hidden hover:border-red-500/50 transition-all hover:shadow-lg hover:shadow-red-900/20"
              >
                <div className="aspect-square flex items-center justify-center bg-gradient-to-br from-stone-800 to-stone-900 overflow-hidden">
                  <TeamLogo image={cap.image} size={280} />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-2 h-2 rounded-full ${COND_STYLES[cap.condition]}`} />
                    <span className="text-xs text-slate-400 uppercase tracking-wider">{cap.condition}</span>
                  </div>
                  <h3 className="font-bold text-white group-hover:text-red-400 transition-colors">{cap.name}</h3>
                  <p className="text-sm text-slate-500">{cap.team} • {cap.year}</p>
                  <p className="text-lg font-black text-red-500 mt-3">₱{cap.price.toLocaleString()}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* FULL COLLECTION */}
      <section id="collection" className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl font-black uppercase tracking-wide">Full Collection</h2>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search caps..."
                className="w-full sm:w-56 pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              />
            </div>
            <div className="relative">
              <select
                value={filter} onChange={e => setFilter(e.target.value)}
                className="appearance-none pl-4 pr-9 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              >
                <option value="all" className="text-black">All Teams</option>
                {teams.map(t => <option key={t} value={t} className="text-black">{t}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map(cap => (
            <button
              key={cap.id}
              onClick={() => setSelected(cap)}
              className="group text-left bg-black rounded-xl border border-white/10 overflow-hidden hover:border-red-500/40 transition-all hover:shadow-md"
            >
              <div className="aspect-square flex items-center justify-center bg-gradient-to-b from-stone-800 to-stone-900 overflow-hidden">
                <TeamLogo image={cap.image} size={200} />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-sm text-white group-hover:text-red-400 transition-colors truncate">{cap.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{cap.team} • {cap.year}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-slate-400 capitalize flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${COND_STYLES[cap.condition]}`} />
                    {cap.condition}
                  </span>
                  <span className="font-black text-red-500 text-sm">₱{cap.price.toLocaleString()}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <div className="flex justify-center mb-4"><NBALogo size={60}/></div>
            <p className="font-bold text-lg">No caps found</p>
          </div>
        )}
      </section>

      {/* CONTACT SECTION */}
      {contact && (
        <section id="contact" className="border-t border-white/10 bg-stone-900/50">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-black uppercase tracking-wide mb-2">Contact the Seller</h2>
              <p className="text-slate-400 text-sm">Interested in a cap? Get in touch!</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Seller Info */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-red-600/20 flex items-center justify-center">
                    <Store size={22} className="text-red-400"/>
                  </div>
                  <div>
                    <h3 className="font-black text-white text-lg">{contact.shopName}</h3>
                    <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                      <User size={12} className="text-red-500" />
                      <span>{contact.ownerName}</span>
                    </div>
                  </div>
                </div>
                {contact.bio && (
                  <p className="text-slate-300 text-sm leading-relaxed pl-1 border-l-2 border-red-500/30 ml-1">{contact.bio}</p>
                )}
                <div className="space-y-3 pt-2">
                  {contact.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                        <Phone size={14} className="text-red-400"/>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs uppercase tracking-wider font-bold">Phone</p>
                        <a href={`tel:${contact.phone}`} className="text-white hover:text-red-400 transition-colors">{contact.phone}</a>
                      </div>
                    </div>
                  )}
                  {contact.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                        <Mail size={14} className="text-red-400"/>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs uppercase tracking-wider font-bold">Email</p>
                        <a href={`mailto:${contact.email}`} className="text-white hover:text-red-400 transition-colors">{contact.email}</a>
                      </div>
                    </div>
                  )}
                  {contact.address && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                        <MapPin size={14} className="text-red-400"/>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs uppercase tracking-wider font-bold">Address</p>
                        <p className="text-white">{contact.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* Social & Marketplace Links */}
              <div className="space-y-4">
                <h3 className="font-bold text-white uppercase text-sm tracking-wider mb-4">Find Us Online</h3>
                {[
                  { label: 'Facebook', value: contact.facebook, icon: <FacebookIcon size={24} className="text-[#1877F2]" />, color: 'hover:border-blue-500 hover:bg-blue-500/10' },
                  { label: 'Instagram', value: contact.instagram, icon: <InstagramIcon size={24} className="text-[#E4405F]" />, color: 'hover:border-pink-500 hover:bg-pink-500/10' },
                ].map(item => item.value ? (
                  <a
                    key={item.label}
                    href={item.value.startsWith('http') ? item.value : `https://${item.value}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-4 p-4 rounded-xl border border-white/10 ${item.color} transition-all group`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1">
                      <p className="font-bold text-white text-sm">{item.label}</p>
                      <p className="text-slate-400 text-xs">{item.value}</p>
                    </div>
                    <ExternalLink size={14} className="text-slate-500 group-hover:text-white transition-colors"/>
                  </a>
                ) : null)}
                {contact.messengerUsername && (
                  <a
                    href={`https://m.me/${contact.messengerUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold uppercase text-sm tracking-wider transition-all shadow-lg shadow-blue-600/20 group"
                  >
                    <MessageCircle size={18} className="group-hover:scale-110 transition-transform" /> 
                    Chat on Messenger
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-8 text-center text-sm text-slate-600">
        <p>© 2026 NBA Caps Vault — Vintage Cap Showcase System</p>
      </footer>

      {/* DETAIL MODAL */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && setSelected(null)}
        >
          <div className="bg-stone-900 rounded-2xl border border-white/10 max-w-lg w-full shadow-2xl overflow-hidden animate-slide-up">
            <div className="aspect-video flex items-center justify-center bg-gradient-to-b from-stone-800 to-stone-900 overflow-hidden">
              <TeamLogo image={selected.image} size={320} />
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-xl font-black uppercase">{selected.name}</h2>
                <p className="text-slate-400 text-sm">{selected.team} • {selected.year}</p>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{selected.description}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-xs text-slate-500 uppercase font-bold">Condition</p>
                  <p className="font-bold capitalize flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${COND_STYLES[selected.condition]}`} />
                    {selected.condition}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-xs text-slate-500 uppercase font-bold">Price</p>
                  <p className="font-black text-red-500 mt-1">₱{selected.price.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-xs text-slate-500 uppercase font-bold">Year Released</p>
                  <p className="font-bold mt-1">{selected.year} ({new Date().getFullYear() - selected.year} yrs old)</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-xs text-slate-500 uppercase font-bold">Team</p>
                  <p className="font-bold mt-1">{selected.team}</p>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold uppercase text-sm hover:bg-white/10 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
