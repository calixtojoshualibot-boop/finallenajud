import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Cap } from '../types/Cap';
import TeamLogo from './TeamLogos';
import { ArrowRight, ShoppingBag, ShieldCheck, Star } from 'lucide-react';

interface Props {
  onEnterShowcase: () => void;
  onAdmin: () => void;
}

export default function FrontPage({ onEnterShowcase, onAdmin }: Props) {
  const [featured, setFeatured] = useState<Cap[]>([]);

  useEffect(() => {
    api.getAll().then(caps => {
      setFeatured(caps.filter(c => c.featured).slice(0, 3));
    });
  }, []);

  return (
    <div className="min-h-screen bg-stone-950 text-white font-sans selection:bg-red-600">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-900/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-blue-900/10 rounded-full blur-3xl opacity-30" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="text-2xl font-black uppercase tracking-tighter italic">
          NBA <span className="text-red-500">Vault</span>
        </div>
        <button 
          onClick={onAdmin}
          className="text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-white transition-colors flex items-center gap-2"
        >
          <ShieldCheck size={14} /> Admin Access
        </button>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-red-500 text-xs font-black uppercase tracking-widest">
              <Star size={12} className="fill-red-500" /> Premium Collection
            </div>
            <h1 className="text-6xl sm:text-8xl font-black uppercase tracking-tighter leading-[0.9]">
              AUTHENTIC <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">VINTAGE</span> <br />
              NBA CAPS
            </h1>
            <p className="text-xl text-stone-400 max-w-lg leading-relaxed font-medium">
              The ultimate destination for serious collectors. Explore a curated timeline of basketball history through iconic headwear.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={onEnterShowcase}
                className="group px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest rounded-full transition-all flex items-center gap-3 shadow-lg shadow-red-900/20"
              >
                Enter the Vault <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => {
                  const el = document.getElementById('preview');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-black uppercase tracking-widest rounded-full transition-all"
              >
                Quick Preview
              </button>
            </div>
          </div>

          {/* Featured Preview */}
          <div className="relative animate-slide-up" id="preview">
            <div className="absolute inset-0 bg-red-600/10 rounded-full blur-3xl opacity-20 scale-150" />
            <div className="relative grid grid-cols-2 gap-4">
              {featured.length > 0 ? (
                <>
                  <div className="space-y-4 pt-12">
                    <div className="bg-black border border-white/10 rounded-3xl p-4 transform -rotate-3 hover:rotate-0 transition-transform duration-500 group">
                      <TeamLogo image={featured[0].image} size={200} />
                      <div className="mt-2 text-center">
                        <p className="text-[10px] font-black uppercase text-red-500">{featured[0].team}</p>
                      </div>
                    </div>
                    <div className="bg-stone-900/80 border border-white/5 rounded-3xl p-4 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                      <TeamLogo image={featured[2]?.image || featured[0].image} size={150} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-stone-900/80 border border-white/5 rounded-3xl p-4 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                      <TeamLogo image={featured[1]?.image || featured[0].image} size={180} />
                    </div>
                    <div className="bg-black border border-white/10 rounded-3xl p-8 flex items-center justify-center aspect-square transform rotate-6 hover:rotate-0 transition-transform duration-500">
                      <div className="text-center">
                        <ShoppingBag size={32} className="mx-auto text-red-500 mb-2" />
                        <p className="text-xs font-bold uppercase tracking-tighter">Verified Authentic</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="col-span-2 h-96 flex items-center justify-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                   <p className="text-stone-500 font-bold uppercase tracking-widest">Vault is loading...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Features Strip */}
      <section className="bg-stone-900/30 border-y border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { t: 'Curated History', d: 'Only original pieces from 70s, 80s, and 90s eras.' },
            { t: 'Pristine Quality', d: 'Every cap graded from Excellent to Deadstock condition.' },
            { t: 'Secure Trade', d: 'Direct contact with verified Philippine collectors.' },
          ].map(f => (
            <div key={f.t} className="space-y-2">
              <h3 className="text-lg font-black uppercase text-white tracking-tight italic">{f.t}</h3>
              <p className="text-sm text-stone-500 leading-relaxed font-medium">{f.d}</p>
            </div>
          ))}
        </div>
      </section>
{/* Google Maps Embed for 96G5+QH, Hinunangan, Southern Leyte */}
<div 
  className="map-container" 
  style={{ 
    width: "100%", 
    maxWidth: "600px", 
    borderRadius: "12px", 
    overflow: "hidden", 
    marginTop: "2rem" 
  }}
>
  <iframe 
    width="100%" 
    height="400" 
    frameBorder="0" 
    scrolling="no" 
    marginHeight={0} 
    marginWidth={0} 
    src="https://maps.google.com/maps?q=96G5+QH,+Hinunangan,+Southern+Leyte&t=&z=15&ie=UTF8&iwloc=&output=embed"
    style={{ border: 0 }}
    allowFullScreen 
    loading="lazy"
  ></iframe>
</div>
      {/* Footer */}
      <footer className="py-12 text-center">
        <p className="text-xs text-stone-700 uppercase tracking-widest font-black">
          © 2026 NBA CAPS VAULT — EST. MANILA, PH
        </p>
      </footer>
    </div>
  );
}
