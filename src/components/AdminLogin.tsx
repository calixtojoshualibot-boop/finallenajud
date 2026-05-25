import { useState } from 'react';
import { api } from '../services/api';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';

interface Props { onSuccess: () => void; onBack: () => void; }

export default function AdminLogin({ onSuccess, onBack }: Props) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@caps.ph');
  const [password, setPassword] = useState('admin123');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isRegister) {
        const user = await api.register(name, email, password);
        if (user) onSuccess();
        else setError('Registration failed. Please try another email.');
      } else {
        const user = await api.login(email, password);
        if (user) onSuccess();
        else setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-start mb-8">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Back to Showcase
          </button>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white uppercase">{isRegister ? 'Create Account' : 'Admin Login'}</h1>
          <p className="text-slate-500 text-sm mt-1">{isRegister ? 'Join the NBA Caps Vault' : 'Access the management panel'}</p>
        </div>
        <form onSubmit={submit} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 space-y-5">
          {error && <div className={`flex items-center gap-2 p-3 rounded-lg ${error.includes('successful') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'} text-sm`}><AlertCircle size={16}/>{error}</div>}
          
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 opacity-0"/>
                <input type="text" value={name} onChange={e=>setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-red-500" required/>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500" required/>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
              <input type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}
                className="w-full pl-9 pr-11 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500" required/>
              <button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {show ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-bold uppercase tracking-wider hover:from-red-700 hover:to-red-600 transition-all shadow-lg shadow-red-600/25 disabled:opacity-50">
            {loading ? 'Processing...' : (isRegister ? 'Register' : 'Sign In')}
          </button>
          
          <div className="text-center pt-2">
            <button type="button" onClick={() => setIsRegister(!isRegister)} className="text-xs text-red-500 hover:text-red-400 font-bold uppercase tracking-widest">
              {isRegister ? 'Already have an account? Login' : 'Need an account? Register'}
            </button>
          </div>

          {!isRegister && <p className="text-xs text-slate-600 text-center">Demo Admin: admin@caps.ph / admin123</p>}
        </form>
      </div>
    </div>
  );
}
