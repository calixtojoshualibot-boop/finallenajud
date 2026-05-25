import { useState, useEffect, useRef } from 'react';
import { Cap, SellerContact, UserAccount, Order } from '../types/Cap';
import { api } from '../services/api';
import TeamLogo, { NBALogo } from './TeamLogos';
import {
  Plus, Edit2, Trash2, Eye, ArrowLeft, Save, X, Search, Star, StarOff, Upload, Camera, Settings, Phone, Mail, MapPin
} from 'lucide-react';

interface Props { onBack: () => void; onLogout: () => void; }

const CONDITIONS = ['Good','Rennovate'] as const;
const COND_STYLES: Record<string,string> = {
  deadstock:'bg-emerald-500', 'near-mint':'bg-green-500', excellent:'bg-blue-500',
  good:'bg-yellow-500', fair:'bg-orange-500', beater:'bg-red-500',
};

export default function Admin({ onBack, onLogout }: Props) {
  const user = api.getUser();
  const isAdmin = user?.role === 'admin';

  const [caps, setCaps] = useState<Cap[]>([]);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'list'|'form'|'view'|'settings'|'orders'|'users'>(() => {
    return (localStorage.getItem('admin_active_tab') as any) || 'list';
  });

  useEffect(() => {
    localStorage.setItem('admin_active_tab', tab);
  }, [tab]);
  const [editing, setEditing] = useState<Cap|null>(null);
  const [viewing, setViewing] = useState<Cap|null>(null);
  const [del, setDel] = useState<Cap|null>(null);

  // contact form
  const [contact, setContact] = useState<SellerContact>({ shopName: '', ownerName: '', phone: '', email: '', address: '', facebook: '', instagram: '', messengerUsername: '', bio: '' });
  const [contactSaved, setContactSaved] = useState(false);

  // form
  const [fName, setFName] = useState('');
  const [fTeam, setFTeam] = useState('');
  const [fYear, setFYear] = useState(1995);
  const [fCond, setFCond] = useState<Cap['condition']>('good');
  const [fPrice, setFPrice] = useState(0);
  const [fDesc, setFDesc] = useState('');
  const [fImage, setFImage] = useState('bulls');
  const [fFeat, setFFeat] = useState(false);
  const [fUpload, setFUpload] = useState('');
  const [errors, setErrors] = useState<Record<string,string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setFUpload(base64);
      setFImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const load = async () => {
    try {
      const [capsData, contactData] = await Promise.all([api.getAll(), api.getContact()]);
      setCaps(capsData);
      setContact(contactData);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    }
  };
  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setFName(''); setFTeam(''); setFYear(1995); setFCond('good');
    setFPrice(0); setFDesc(''); setFImage('bulls'); setFFeat(false);
    setFUpload(''); setErrors({}); setEditing(null);
  };

  const openCreate = () => { resetForm(); setTab('form'); };
  const openEdit = (c: Cap) => {
    setEditing(c); setFName(c.name); setFTeam(c.team); setFYear(c.year);
    setFCond(c.condition); setFPrice(c.price); setFDesc(c.description);
    setFImage(c.image); setFFeat(c.featured);
    setFUpload(c.image.startsWith('data:') ? c.image : '');
    setTab('form');
  };
  const openView = (c: Cap) => { setViewing(c); setTab('view'); };

  const validate = () => {
    const e: Record<string,string> = {};
    if (!fName.trim()) e.name = 'Required';
    if (!fTeam.trim()) e.team = 'Required';
    if (!fDesc.trim()) e.desc = 'Required';
    if (fPrice < 0) e.price = 'Invalid';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    const data = { name:fName, team:fTeam, year:fYear, condition:fCond, price:fPrice, description:fDesc, image:fImage, featured:fFeat };
    try {
      if (editing) await api.update(editing.id, data);
      else await api.create(data);
      await load();
      resetForm();
      setTab('list');
    } catch (error) {
      console.error('Failed to save cap:', error);
      alert('Unable to save cap. Please check the backend/database connection.');
    }
  };

  const remove = async (c: Cap) => {
    try {
      await api.remove(c.id);
      setDel(null);
      await load();
    } catch (error) {
      console.error('Failed to delete cap:', error);
      alert('Unable to delete cap. Please check the backend/database connection.');
    }
  };

  const teams = [...new Set(caps.map(c=>c.team))].sort();
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [allUsers, setAllUsers] = useState<UserAccount[]>([]);

  const filtered = caps.filter(c => {
    const s = search.toLowerCase();
    return c.name.toLowerCase().includes(s) || c.team.toLowerCase().includes(s);
  });

  useEffect(() => {
    if (tab === 'orders') {
      api.getOrders().then(data => {
        if (Array.isArray(data)) setAllOrders(data);
        else setAllOrders([]);
      }).catch(err => {
        console.error("Order fetch error:", err);
        setAllOrders([]);
      });
    }
    if (tab === 'users') {
      api.getUsers().then(data => {
        if (Array.isArray(data)) setAllUsers(data);
        else setAllUsers([]);
      }).catch(err => {
        console.error("User fetch error:", err);
        setAllUsers([]);
      });
    }
  }, [tab]);

  const updateOrder = async (id: string, status: Order['status']) => {
    await api.updateOrderStatus(id, status);
    api.getOrders().then(setAllOrders);
  };

  // ─── LIST ─────────────────────────────────
  if (tab === 'list') {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Top Bar */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase text-red-500 leading-none">Welcome, {user?.name}</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">{user?.role} Access</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-bold hidden sm:block">{caps.length} items</span>
              {isAdmin && (
                <>
                  <button onClick={()=>setTab('list')} className={`text-xs font-black uppercase px-3 py-2 rounded-lg transition-all ${tab==='list'?'bg-red-600 text-white':'text-slate-500 hover:bg-slate-100'}`}>Products</button>
                  <button onClick={()=>setTab('orders')} className="text-xs font-black uppercase px-3 py-2 rounded-lg transition-all text-slate-500 hover:bg-slate-100">Orders</button>
                  <button onClick={()=>setTab('users')} className="text-xs font-black uppercase px-3 py-2 rounded-lg transition-all text-slate-500 hover:bg-slate-100">Accounts</button>
                  <button onClick={()=>setTab('settings')} className="text-xs font-black uppercase px-3 py-2 rounded-lg transition-all text-slate-500 hover:bg-slate-100">Settings</button>
                </>
              )}
              <div className="h-4 w-px bg-slate-200 mx-1" />
              <button onClick={onBack} className="text-xs font-black uppercase px-3 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">Showcase</button>
              <button onClick={onLogout} className="text-xs font-black uppercase px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg">Logout</button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 sm:flex-initial">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..."
                className="w-full sm:w-64 pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"/>
            </div>
            {isAdmin && (
              <button onClick={openCreate}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 font-bold uppercase text-sm tracking-wider shadow-sm">
                <Plus size={16}/> Add New Cap
              </button>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead><tr className="bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">Cap</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">Team</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">Year</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">Condition</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">Price</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">Featured</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-slate-500 uppercase">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-16 text-center text-slate-400">
                    <span className="flex justify-center mb-2"><NBALogo size={48}/></span>No caps found
                  </td></tr>
                ) : filtered.map(c => (
                  <tr key={c.id} className="hover:bg-red-50/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <TeamLogo image={c.image} size={44}/>
                        <span className="font-bold text-sm text-slate-800">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600">{c.team}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-slate-700">{c.year}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-white ${COND_STYLES[c.condition]}`}>
                        {c.condition}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-black text-sm text-slate-800">₱{c.price.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      {c.featured ? <Star size={16} className="text-yellow-500 fill-yellow-500"/> : <StarOff size={16} className="text-slate-300"/>}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={()=>openView(c)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700" title="View"><Eye size={15}/></button>
                        {isAdmin && (
                          <>
                            <button onClick={()=>openEdit(c)} className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600" title="Edit"><Edit2 size={15}/></button>
                            <button onClick={()=>setDel(c)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600" title="Delete"><Trash2 size={15}/></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 text-sm text-slate-500">
              Showing <strong>{filtered.length}</strong> of <strong>{caps.length}</strong> • Total value: <strong className="text-red-600">₱{filtered.reduce((s,c)=>s+c.price,0).toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {/* Delete Modal */}
        {del && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={e=>e.target===e.currentTarget&&setDel(null)}>
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-slide-up">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><Trash2 size={28} className="text-red-600"/></div>
              <h3 className="text-lg font-black text-slate-800 mb-2">Delete Cap?</h3>
              <p className="text-slate-500 text-sm mb-6">Remove <strong>{del.name}</strong> from the vault?</p>
              <div className="flex gap-3">
                <button onClick={()=>setDel(null)} className="flex-1 py-2.5 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                <button onClick={()=>remove(del)} className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── VIEW ─────────────────────────────────
  if (tab === 'view' && viewing) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-3">
            <h1 className="font-black text-lg uppercase">Cap Details</h1>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="aspect-video flex items-center justify-center bg-gradient-to-b from-slate-100 to-slate-50 overflow-hidden">
              <TeamLogo image={viewing.image} size={300}/>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black uppercase">{viewing.name}</h2>
                {viewing.featured && <span className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full"><Star size={12} className="fill-yellow-500"/> Featured</span>}
              </div>
              <p className="text-slate-500">{viewing.team} • {viewing.year} • {new Date().getFullYear()-viewing.year} years old</p>
              <p className="text-slate-700 leading-relaxed">{viewing.description}</p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-red-50"><p className="text-xs font-bold text-red-500 uppercase">Price</p><p className="text-xl font-black text-red-600">₱{viewing.price.toLocaleString()}</p></div>
                <div className="p-3 rounded-lg bg-slate-50"><p className="text-xs font-bold text-slate-500 uppercase">Condition</p><p className="font-bold capitalize flex items-center gap-2 mt-1"><span className={`w-2.5 h-2.5 rounded-full ${COND_STYLES[viewing.condition]}`}/>{viewing.condition}</p></div>
              </div>
              <button onClick={()=>setTab('list')} className="w-full py-3 rounded-xl bg-slate-100 text-slate-700 font-bold uppercase text-sm hover:bg-slate-200">Back to List</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── ORDERS ─────────────────────────────
  if (tab === 'orders') {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <h1 className="font-black text-lg uppercase">Manage Orders</h1>
            <div className="flex gap-2">
               <button onClick={()=>setTab('list')} className="text-xs font-black uppercase px-3 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">Back to Products</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          {!Array.isArray(allOrders) || allOrders.length === 0 ? (
             <div className="bg-white rounded-xl border border-dashed border-slate-300 p-20 text-center text-slate-400 font-bold uppercase">No orders found</div>
          ) : (
            allOrders.map(order => (
              <div key={order?.id || Math.random()} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase">Customer: {order?.userName || 'N/A'}</span>
                    <p className="font-bold text-slate-800">Order #{order?.id?.slice(-8).toUpperCase() || 'N/A'}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <select 
                      value={order?.status || 'pending'} 
                      onChange={(e) => updateOrder(order.id, e.target.value as any)}
                      className="text-xs font-bold uppercase p-2 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="repacking">Repacking</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <span className="text-[10px] font-bold text-slate-400">{order?.date || ''}</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        {Array.isArray(order?.items) ? order.items.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-slate-600 font-medium">{item?.name || 'Item'} x{item?.quantity || 0}</span>
                            <span className="font-bold">₱{((item?.price || 0) * (item?.quantity || 0)).toLocaleString()}</span>
                          </div>
                        )) : <p className="text-xs text-slate-400 italic">No items details</p>}
                     </div>
                     <div className="bg-slate-50 p-4 rounded-lg space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase">Payment</p>
                              <p className="text-sm font-bold uppercase text-red-600">{order?.paymentMethod || 'N/A'}</p>
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase">Type</p>
                              <p className="text-sm font-bold uppercase text-red-600">{order?.deliveryType || 'N/A'}</p>
                           </div>
                           <div className="col-span-2">
                              <p className="text-[10px] font-black text-slate-400 uppercase">Phone / Address</p>
                              <p className="text-xs font-bold text-slate-800">{order?.phone || 'N/A'}</p>
                              <p className="text-xs text-slate-600">{order?.address || 'N/A'}</p>
                           </div>
                           {order?.notes && (
                             <div className="col-span-2 p-2 bg-yellow-50 rounded border border-yellow-100">
                               <p className="text-[9px] font-black text-yellow-600 uppercase">Notes</p>
                               <p className="text-xs italic text-slate-700">{order.notes}</p>
                             </div>
                           )}
                        </div>
                        <div className="flex justify-between items-end pt-2 border-t border-slate-200">
                           <span className="text-xs font-black text-slate-400 uppercase">Total Collected</span>
                           <span className="text-2xl font-black text-slate-900">₱{order?.total?.toLocaleString() || '0'}</span>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // ─── USERS ──────────────────────────────
  if (tab === 'users') {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <h1 className="font-black text-lg uppercase">User Accounts</h1>
            <button onClick={()=>setTab('list')} className="text-xs font-black uppercase px-3 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">Back</button>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
             <table className="w-full">
                <thead><tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left p-4 text-xs font-black uppercase text-slate-500">Name</th>
                  <th className="text-left p-4 text-xs font-black uppercase text-slate-500">Email</th>
                  <th className="text-left p-4 text-xs font-black uppercase text-slate-500">Role</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {allUsers.map(u => (
                    <tr key={u.id}>
                      <td className="p-4 font-bold text-slate-800">{u.name}</td>
                      <td className="p-4 text-slate-600 text-sm">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${u.role === 'admin' ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-600'}`}>{u.role}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        </div>
      </div>
    );
  }

  // ─── SETTINGS ─────────────────────────────
  if (tab === 'settings') {
    const updateContact = (field: keyof SellerContact, value: string) => {
      setContact(prev => ({ ...prev, [field]: value }));
      setContactSaved(false);
    };

    const saveContact = async () => {
      try {
        const savedContact = await api.saveContact(contact);
        setContact(savedContact);
        setContactSaved(true);
        setTimeout(() => setContactSaved(false), 3000);
      } catch (error) {
        console.error('Failed to save contact:', error);
        alert('Unable to save contact details. Please check the backend/database connection.');
      }
    };

    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-3">
            <button onClick={()=>setTab('list')} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"><ArrowLeft size={18}/></button>
            <Settings size={18} className="text-slate-500"/>
            <h1 className="font-black text-lg uppercase">Seller Contact Settings</h1>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">

            {contactSaved && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold flex items-center gap-2">
                ✅ Contact information saved successfully!
              </div>
            )}

            {/* Shop Info */}
            <div>
              <h3 className="font-black text-slate-800 uppercase text-sm tracking-wider mb-4">Shop Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Shop Name</label>
                  <input value={contact.shopName} onChange={e=>updateContact('shopName', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Owner Name</label>
                  <input value={contact.ownerName} onChange={e=>updateContact('ownerName', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"/>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Bio / About</label>
                <textarea value={contact.bio} onChange={e=>updateContact('bio', e.target.value)} rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"/>
              </div>
            </div>

            {/* Contact Details */}
            <div>
              <h3 className="font-black text-slate-800 uppercase text-sm tracking-wider mb-4">Contact Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1"><Phone size={12}/> Phone Number</label>
                  <input value={contact.phone} onChange={e=>updateContact('phone', e.target.value)}
                    placeholder="+63 917 123 4567"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1"><Mail size={12}/> Email Address</label>
                  <input value={contact.email} onChange={e=>updateContact('email', e.target.value)}
                    placeholder="seller@capsvault.ph"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1"><MapPin size={12}/> Address</label>
                  <textarea value={contact.address} onChange={e=>updateContact('address', e.target.value)} rows={2}
                    placeholder="Full address for meet-ups"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"/>
                </div>
              </div>
            </div>

            {/* Social & Marketplace */}
            <div>
              <h3 className="font-black text-slate-800 uppercase text-sm tracking-wider mb-4">Social & Marketplace Links</h3>
              <div className="space-y-4">
                {[
                  { key: 'facebook' as keyof SellerContact, label: 'Facebook Page URL', placeholder: 'facebook.com/capsvaultmanila', icon: '📘' },
                  { key: 'instagram' as keyof SellerContact, label: 'Instagram Handle', placeholder: '@capsvaultmanila', icon: '📸' },
                  { key: 'messengerUsername' as keyof SellerContact, label: 'Messenger Username (for m.me link)', placeholder: 'capsvaultmanila', icon: '💬' },
                ].map(item => (
                  <div key={item.key}>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">{item.icon} {item.label}</label>
                    <input value={contact[item.key]} onChange={e=>updateContact(item.key, e.target.value)}
                      placeholder={item.placeholder}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"/>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button onClick={()=>setTab('list')} className="flex-1 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 flex items-center justify-center gap-2">
                <X size={16}/> Cancel
              </button>
              <button onClick={saveContact} className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 flex items-center justify-center gap-2 shadow-sm">
                <Save size={16}/> Save Contact Info
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── FORM (Create / Edit) ─────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-3">
          <h1 className="font-black text-lg uppercase">{editing ? 'Edit Cap' : 'Add New Cap'}</h1>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Cap Name *</label>
            <input value={fName} onChange={e=>{setFName(e.target.value);if(errors.name)setErrors(p=>({...p,name:''}));}}
              placeholder="e.g. Bulls Dynasty Snapback"
              className={`w-full px-4 py-2.5 rounded-lg border ${errors.name?'border-red-400 bg-red-50':'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-red-500`}/>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          {/* Team */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Team *</label>
            <input value={fTeam} onChange={e=>{setFTeam(e.target.value);if(errors.team)setErrors(p=>({...p,team:''}));}}
              list="teams" placeholder="e.g. Chicago Bulls"
              className={`w-full px-4 py-2.5 rounded-lg border ${errors.team?'border-red-400 bg-red-50':'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-red-500`}/>
            <datalist id="teams">{teams.map(t=><option key={t} value={t}/>)}</datalist>
            {errors.team && <p className="text-red-500 text-xs mt-1">{errors.team}</p>}
          </div>
          {/* Year + Condition */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Year Released</label>
              <input type="number" value={fYear} onChange={e=>setFYear(Number(e.target.value))} min={1946} max={new Date().getFullYear()}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"/>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Condition</label>
              <select value={fCond} onChange={e=>setFCond(e.target.value as Cap['condition'])}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white capitalize">
                {CONDITIONS.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          {/* Price */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Price (₱)</label>
            <input type="number" value={fPrice} onChange={e=>setFPrice(Number(e.target.value))} min={0}
              className={`w-full px-4 py-2.5 rounded-lg border ${errors.price?'border-red-400 bg-red-50':'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-red-500`}/>
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          </div>

          {/* Picture Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Cap Picture</label>
            <div className="flex items-start gap-4">
              {/* Preview */}
              <div className="w-28 h-28 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                {fImage ? (
                  <TeamLogo image={fImage} size={112}/>
                ) : (
                  <Camera size={28} className="text-slate-300"/>
                )}
              </div>
              {/* Upload controls */}
              <div className="flex-1 space-y-2">
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden"/>
                <button type="button" onClick={()=>fileRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed border-slate-300 text-slate-600 hover:border-red-400 hover:text-red-600 hover:bg-red-50 transition-all text-sm font-semibold">
                  <Upload size={16}/> Upload Photo
                </button>
                <p className="text-xs text-slate-400">JPG, PNG or SVG. Or pick a team logo below.</p>
                {/* Team Logo Selector */}
                <select value={fUpload ? '' : fImage} onChange={e=>{setFUpload('');setFImage(e.target.value);}}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-sm">
                  <option value="">— Or choose team logo —</option>
                  <option value="bulls">Chicago Bulls</option>
                  <option value="lakers">Los Angeles Lakers</option>
                  <option value="celtics">Boston Celtics</option>
                  <option value="warriors">Golden State Warriors</option>
                  <option value="knicks">New York Knicks</option>
                  <option value="heat">Miami Heat</option>
                  <option value="spurs">San Antonio Spurs</option>
                  <option value="raptors">Toronto Raptors</option>
                  <option value="suns">Phoenix Suns</option>
                  <option value="bucks">Milwaukee Bucks</option>
                  <option value="magic">Orlando Magic</option>
                  <option value="rockets">Houston Rockets</option>
                </select>
                {fUpload && (
                  <button type="button" onClick={()=>{setFUpload('');setFImage('bulls');}}
                    className="text-xs text-red-500 hover:text-red-700 font-semibold">
                    ✕ Remove uploaded photo
                  </button>
                )}
              </div>
            </div>
          </div>
          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Description *</label>
            <textarea value={fDesc} onChange={e=>{setFDesc(e.target.value);if(errors.desc)setErrors(p=>({...p,desc:''}));}}
              rows={3} placeholder="Describe the cap..."
              className={`w-full px-4 py-2.5 rounded-lg border ${errors.desc?'border-red-400 bg-red-50':'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-red-500 resize-none`}/>
            {errors.desc && <p className="text-red-500 text-xs mt-1">{errors.desc}</p>}
          </div>
          {/* Featured toggle */}
          <button type="button" onClick={()=>setFFeat(!fFeat)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-bold transition-all ${fFeat?'border-yellow-400 bg-yellow-50 text-yellow-700':'border-slate-200 text-slate-500'}`}>
            {fFeat ? <><Star size={16} className="fill-yellow-500 text-yellow-500"/> Featured on Showcase</> : <><StarOff size={16}/> Not Featured</>}
          </button>
          {/* Preview */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200">
              <TeamLogo image={fImage} size={80}/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 truncate">{fName || 'Cap Name'}</p>
              <p className="text-sm text-slate-500">{fTeam || 'Team'} • {fYear}</p>
              <p className="text-sm font-black text-red-600">₱{fPrice.toLocaleString()}</p>
            </div>
            {fUpload && <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-full">📷 Custom Photo</span>}
          </div>
          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button onClick={()=>{setTab('list');resetForm();}} className="flex-1 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 flex items-center justify-center gap-2"><X size={16}/>Cancel</button>
            <button onClick={save} className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 flex items-center justify-center gap-2 shadow-sm"><Save size={16}/>{editing?'Update':'Add to Vault'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
