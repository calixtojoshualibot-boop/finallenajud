import { useState, useEffect } from 'react';
import { Cap, Order } from '../types/Cap';
import { api } from '../services/api';
import TeamLogo from './TeamLogos';
import { ShoppingCart, Trash2, Package, CreditCard, MapPin } from 'lucide-react';

interface Props {
  onLogout: () => void;
  onBackToShowcase: () => void;
}

export default function UserDashboard({ onLogout, onBackToShowcase }: Props) {
  const user = api.getUser();
  const [caps, setCaps] = useState<Cap[]>([]);
  const [cart, setCart] = useState<{cap: Cap, qty: number}[]>(() => {
    const saved = localStorage.getItem('user_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<'browse' | 'cart' | 'orders'>(() => {
    return (localStorage.getItem('user_active_tab') as any) || 'browse';
  });

  // Checkout Form State
  const [address, setAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'cash'>('cash');
  const [deliveryType, setDeliveryType] = useState<'cod' | 'pickup'>('pickup');
  const [isOrdering, setIsOrdering] = useState(false);

  useEffect(() => {
    localStorage.setItem('user_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('user_active_tab', tab);
  }, [tab]);

  useEffect(() => {
    api.getAll().then(setCaps);
    api.getOrders().then(list => {
      setOrders(list.filter(o => o.userId === user?.id));
    });
  }, [user?.id]);

  const addToCart = (cap: Cap) => {
    setCart(prev => {
      const existing = prev.find(item => item.cap.id === cap.id);
      if (existing) {
        return prev.map(item => item.cap.id === cap.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { cap, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.cap.id !== id));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.cap.price * item.qty), 0);

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || cart.length === 0) return;
    setIsOrdering(true);
    const orderData: Omit<Order, 'id' | 'date'> = {
      userId: user.id,
      userName: user.name,
      items: cart.map(i => ({ ...i.cap, quantity: i.qty })),
      total: cartTotal,
      status: 'pending',
      paymentMethod,
      deliveryType,
      address,
      phone,
      notes,
    };
    await api.createOrder(orderData);
    setCart([]);
    setTab('orders');
    setIsOrdering(false);
    api.getOrders().then(list => setOrders(list.filter(o => o.userId === user.id)));
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="bg-stone-900 border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button onClick={onBackToShowcase} className="font-black text-red-600 uppercase tracking-tighter italic text-xl">NBA Vault</button>
            <div className="hidden sm:flex gap-6">
              {['browse', 'orders'].map((t) => (
                <button 
                  key={t}
                  onClick={() => setTab(t as any)} 
                  className={`text-xs font-black uppercase tracking-widest transition-colors ${tab === t ? 'text-red-500' : 'text-stone-500 hover:text-white'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setTab('cart')} className="relative p-2 text-stone-400 hover:text-red-500 transition-colors">
              <ShoppingCart size={22} />
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-stone-900">{cart.length}</span>}
            </button>
            <div className="h-6 w-px bg-white/10 mx-2" />
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-stone-500 uppercase leading-none">{user?.role}</p>
              <p className="text-sm font-bold text-white">{user?.name}</p>
            </div>
            <button onClick={onLogout} className="text-[10px] font-black text-red-500 uppercase border border-red-500/20 px-3 py-2 rounded-xl hover:bg-red-500/10 transition-colors">Logout</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {tab === 'browse' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-end">
               <h1 className="text-4xl font-black uppercase tracking-tighter">Vault <span className="text-red-600">Collection</span></h1>
               <p className="text-stone-500 text-sm font-bold uppercase">{caps.length} items available</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {caps.map(cap => (
                <div key={cap.id} className="bg-stone-900/50 rounded-3xl border border-white/5 overflow-hidden group hover:border-red-500/30 transition-all flex flex-col">
                  <div className="aspect-square bg-stone-900 flex items-center justify-center overflow-hidden p-6">
                    <TeamLogo image={cap.image} size={220} />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-white group-hover:text-red-400 transition-colors">{cap.name}</h3>
                      <p className="text-[10px] text-stone-500 uppercase font-black tracking-widest mt-1">{cap.team} • {cap.year}</p>
                    </div>
                    <div className="flex flex-col gap-3 mt-6">
                      <div className="flex items-center justify-between">
                         <span className="font-black text-lg text-white">₱{cap.price.toLocaleString()}</span>
                         <div className="flex items-center bg-black border border-white/10 rounded-lg overflow-hidden">
                            <button 
                              onClick={(e) => { e.stopPropagation(); const el = e.currentTarget.nextElementSibling as HTMLInputElement; el.value = Math.max(1, parseInt(el.value) - 1).toString(); }}
                              className="px-2 py-1 hover:bg-white/5 text-stone-500"
                            >-</button>
                            <input 
                              type="number" 
                              defaultValue="1" 
                              min="1" 
                              id={`qty-${cap.id}`}
                              className="w-8 bg-transparent text-center text-[10px] font-bold border-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                            />
                            <button 
                              onClick={(e) => { e.stopPropagation(); const el = e.currentTarget.previousElementSibling as HTMLInputElement; el.value = (parseInt(el.value) + 1).toString(); }}
                              className="px-2 py-1 hover:bg-white/5 text-stone-500"
                            >+</button>
                         </div>
                      </div>
                      <button 
                        onClick={() => {
                          const qty = parseInt((document.getElementById(`qty-${cap.id}`) as HTMLInputElement).value) || 1;
                          for(let i=0; i<qty; i++) addToCart(cap);
                        }} 
                        className="w-full bg-red-600 text-white text-[10px] font-black uppercase tracking-widest py-2.5 rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-900/20 active:scale-95"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'cart' && (
          <div className="max-w-5xl mx-auto animate-fade-in space-y-8">
            <h1 className="text-4xl font-black uppercase tracking-tighter">Shopping <span className="text-red-600">Cart</span></h1>
            {cart.length === 0 ? (
              <div className="bg-stone-900/50 rounded-3xl border border-dashed border-white/10 p-20 text-center">
                <ShoppingCart size={64} className="mx-auto text-stone-700 mb-4" />
                <p className="text-stone-500 font-black uppercase tracking-widest">Your vault is empty</p>
                <button onClick={() => setTab('browse')} className="mt-6 px-8 py-3 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all">Start Browsing</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* List */}
                <div className="lg:col-span-3 space-y-4">
                  {cart.map(item => (
                    <div key={item.cap.id} className="bg-stone-900/50 rounded-2xl border border-white/5 p-4 flex items-center gap-6">
                      <div className="w-20 h-20 rounded-xl bg-stone-900 flex items-center justify-center p-2"><TeamLogo image={item.cap.image} size={64} /></div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white">{item.cap.name}</h4>
                        <p className="text-sm text-red-500 font-black mt-1">₱{item.cap.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-black text-stone-500">QTY: {item.qty}</span>
                        <button onClick={() => removeFromCart(item.cap.id)} className="p-3 bg-white/5 rounded-xl text-stone-500 hover:text-red-500 hover:bg-red-500/10 transition-all"><Trash2 size={20}/></button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Checkout Form */}
                <div className="lg:col-span-2">
                  <form onSubmit={placeOrder} className="bg-stone-900 rounded-3xl border border-white/10 p-6 space-y-6 sticky top-24">
                    <h3 className="text-xl font-black uppercase tracking-tight text-white border-b border-white/5 pb-4">Checkout</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-stone-500 mb-2 tracking-widest">Contact Phone</label>
                        <div className="relative">
                          <input type="text" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 transition-all" placeholder="0917XXXXXXX" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-black uppercase text-stone-500 mb-2 tracking-widest">Delivery Address</label>
                        <textarea required value={address} onChange={e => setAddress(e.target.value)} rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 transition-all resize-none" placeholder="Full address for delivery" />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase text-stone-500 mb-2 tracking-widest">Payment Method</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['cash', 'gcash'].map(m => (
                            <button key={m} type="button" onClick={() => setPaymentMethod(m as any)} className={`py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 transition-all ${paymentMethod === m ? 'border-red-600 bg-red-600 text-white' : 'border-white/5 bg-white/5 text-stone-500 hover:border-white/10'}`}>{m}</button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase text-stone-500 mb-2 tracking-widest">Delivery Type</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['pickup', 'cod'].map(t => (
                            <button key={t} type="button" onClick={() => setDeliveryType(t as any)} className={`py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 transition-all ${deliveryType === t ? 'border-red-600 bg-red-600 text-white' : 'border-white/5 bg-white/5 text-stone-500 hover:border-white/10'}`}>{t}</button>
                          ))}
                        </div>
                      </div>

                      {paymentMethod === 'gcash' && (
                        <div className="p-4 bg-blue-600/10 border border-blue-600/20 rounded-2xl space-y-2 animate-fade-in">
                           <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase"><CreditCard size={14}/> GCash Details</div>
                           <p className="text-xs text-stone-300">Send to: <strong>09186297545</strong> (Marlo Mitra)</p>
                           <p className="text-[10px] text-stone-500 leading-tight">Please send payment before placing order. Screenshot may be required for validation.</p>
                        </div>
                      )}

                      <div>
                        <label className="block text-[10px] font-black uppercase text-stone-500 mb-2 tracking-widest">Notes (Optional)</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 transition-all resize-none" placeholder="Color preference, best time to call..." />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-xs font-black text-stone-500 uppercase">Total amount</span>
                        <span className="text-2xl font-black text-red-600 tracking-tighter">₱{cartTotal.toLocaleString()}</span>
                      </div>
                      <button type="submit" disabled={isOrdering} className="w-full py-4 bg-red-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-900/40 disabled:opacity-50 active:scale-95">
                        {isOrdering ? 'Securing Order...' : 'Place Vault Order'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'orders' && (
          <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
            <h1 className="text-4xl font-black uppercase tracking-tighter">Order <span className="text-red-600">History</span></h1>
            <div className="space-y-6">
              {orders.length === 0 ? (
                <div className="bg-stone-900/50 rounded-3xl border border-dashed border-white/10 p-20 text-center text-stone-600 font-black uppercase tracking-widest italic">No vault history found</div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="bg-stone-900/50 rounded-3xl border border-white/5 overflow-hidden group">
                    <div className="px-6 py-5 border-b border-white/5 bg-white/5 flex flex-wrap justify-between items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-black border border-white/10 flex items-center justify-center text-red-500 font-black text-xs italic">NB</div>
                        <div>
                          <p className="text-[10px] font-black text-stone-500 uppercase leading-none">ORDER ID</p>
                          <p className="font-bold text-white">#{order.id.slice(-8).toUpperCase()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-[10px] font-black text-stone-500 uppercase leading-none">STATUS</p>
                          <span className={`inline-block mt-1 font-black uppercase text-[10px] tracking-widest ${
                            order.status === 'completed' ? 'text-emerald-500' :
                            order.status === 'cancelled' ? 'text-stone-500' :
                            order.status === 'repacking' ? 'text-blue-400' :
                            order.status === 'processing' ? 'text-orange-400' :
                            'text-red-500'
                          }`}>{order.status}</span>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-stone-500 uppercase leading-none">DATE</p>
                           <p className="text-xs font-bold text-white mt-1">{order.date.split(' ')[0]}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between group/item">
                            <div className="flex items-center gap-4">
                               <TeamLogo image={item.image} size={40} />
                               <div>
                                  <p className="text-sm font-bold text-white group-hover/item:text-red-400 transition-colors">{item.name}</p>
                                  <p className="text-[10px] text-stone-500 font-black uppercase">Qty: {item.quantity} • ₱{item.price.toLocaleString()}</p>
                               </div>
                            </div>
                            <span className="text-sm font-black text-white">₱{(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap justify-between items-end gap-6">
                        <div className="flex gap-8">
                           <div>
                              <p className="text-[10px] font-black text-stone-500 uppercase mb-1">Details</p>
                              <div className="flex items-center gap-2 text-xs font-bold text-stone-300">
                                 <CreditCard size={14} className="text-red-500"/> {order.paymentMethod.toUpperCase()}
                                 <span className="w-1 h-1 rounded-full bg-stone-700"/>
                                 <Package size={14} className="text-red-500"/> {order.deliveryType.toUpperCase()}
                              </div>
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-stone-500 uppercase mb-1">Location</p>
                              <div className="flex items-center gap-2 text-xs font-bold text-stone-300">
                                 <MapPin size={14} className="text-red-500"/> {order.address.slice(0, 30)}...
                              </div>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-stone-500 uppercase mb-1">Final Amount</p>
                           <span className="text-3xl font-black text-red-600 tracking-tighter">₱{order.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
      
      <footer className="py-20 border-t border-white/5 text-center">
         <p className="text-[10px] font-black text-stone-800 uppercase tracking-[0.3em]">NBA CAPS VAULT • ELITE QUALITY GUARANTEED</p>
      </footer>
    </div>
  );
}
