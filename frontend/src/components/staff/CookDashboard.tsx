import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Order, OrderStatus } from '../../types';
import { api } from '../../services/api';
import { subscribeToEvent } from '../../services/socket';
import { KrispierLogo } from '../common/KrispierLogo';
import {
  Clock,
  Flame,
  CheckCircle,
  Volume2,
  VolumeX,
  LogOut,
  AlertTriangle,
} from 'lucide-react';

export const CookDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [, setLoading] = useState(true);

  // Play audio tone on new order
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch {
      // audio error handling
    }
  };

  const loadOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();

    const unsubNew = subscribeToEvent<Order>('order:new', (newOrd) => {
      setOrders((prev) => [newOrd, ...prev]);
      playChime();
    });

    const unsubUpd = subscribeToEvent<Order>('order:updated', (updOrd) => {
      setOrders((prev) => prev.map((o) => (o._id === updOrd._id ? updOrd : o)));
    });

    return () => {
      unsubNew();
      unsubUpd();
    };
  }, [soundEnabled]);

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await api.updateOrderStatus(orderId, status);
    } catch (err: any) {
      alert(err.message || 'Error updating order');
    }
  };

  const activeKitchenOrders = orders.filter((o) =>
    ['new', 'accepted', 'preparing', 'ready'].includes(o.status)
  );

  return (
    <div className="min-h-screen bg-[#151515] text-[#D1D5DB] flex flex-col font-sans selection:bg-[#FFC400] selection:text-black">
      {/* KDS Header */}
      <header className="bg-[#222222] border-b border-[#353535] px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <KrispierLogo size="sm" />
          <div className="border-l border-[#353535] pl-4">
            <h1 className="font-black text-sm uppercase text-white tracking-wider">Kitchen Display (KDS)</h1>
            <div className="text-xs text-[#FFC400] font-bold">Kitchen Master: {user?.name || 'Chef'} · Kasur Fryer Station</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`cursor-pointer flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
              soundEnabled
                ? 'bg-[#151515] text-[#FFC400] border-[#FFC400]'
                : 'bg-[#151515] text-[#888888] border-[#353535]'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 stroke-[2.5]" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? 'Chime Active' : 'Muted'}</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="cursor-pointer flex items-center gap-1.5 px-3.5 py-2 bg-[#151515] hover:bg-[#EF4444] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors border border-[#353535]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit KDS</span>
          </button>
        </div>
      </header>

      {/* Main KDS Board: Grid of large ticket cards */}
      <main className="p-6 flex-1 overflow-y-auto">
        {activeKitchenOrders.length === 0 ? (
          <div className="h-full min-h-[60vh] flex flex-col items-center justify-center text-center space-y-3">
            <CheckCircle className="w-16 h-16 text-[#22C55E] stroke-1" />
            <h2 className="text-xl font-black text-white uppercase tracking-wider">All Food Tickets Fulfilled!</h2>
            <p className="text-xs text-[#A0A0A0] max-w-sm">
              New dining room orders and Kasur delivery tickets will ring an audible chime and appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {activeKitchenOrders.map((ord) => {
              const isNew = ord.status === 'new';
              const isAccepted = ord.status === 'accepted';
              const isPreparing = ord.status === 'preparing';
              const isReady = ord.status === 'ready';

              return (
                <div
                  key={ord._id}
                  className={`rounded-2xl border flex flex-col justify-between overflow-hidden shadow-2xl transition-all ${
                    isNew
                      ? 'bg-[#222222] border-[#FFC400] ring-2 ring-[#FFC400]/40 animate-pulse'
                      : isPreparing
                      ? 'bg-[#222222] border-amber-500'
                      : isReady
                      ? 'bg-[#222222] border-cyan-500 opacity-90'
                      : 'bg-[#222222] border-[#353535]'
                  }`}
                >
                  {/* Ticket Header */}
                  <div
                    className={`p-4 flex items-center justify-between border-b ${
                      isNew
                        ? 'bg-[#151515] border-[#FFC400]/40'
                        : isPreparing
                        ? 'bg-[#151515] border-amber-500/40'
                        : isReady
                        ? 'bg-[#151515] border-cyan-500/40'
                        : 'bg-[#151515] border-[#353535]'
                    }`}
                  >
                    <div>
                      <div className="text-2xl font-black text-white">
                        {ord.orderType === 'dine_in' ? `TABLE ${ord.tableNumber}` : 'DELIVERY'}
                      </div>
                      <span className="text-xs text-[#FFC400] font-mono font-bold">{ord.orderNumber}</span>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg block ${
                          isNew
                            ? 'bg-[#FFC400] text-black font-black'
                            : isAccepted
                            ? 'bg-[#151515] border border-[#FFC400] text-[#FFC400]'
                            : isPreparing
                            ? 'bg-amber-500 text-black font-black'
                            : 'bg-cyan-500 text-black font-black'
                        }`}
                      >
                        {ord.status}
                      </span>
                      <span className="text-[10px] text-[#A0A0A0] mt-1 block">
                        {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Dishes List */}
                  <div className="p-5 flex-1 divide-y divide-[#353535] space-y-3">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="pt-2.5 first:pt-0">
                        <div className="flex items-start justify-between">
                          <span className="text-lg font-black text-white flex items-center gap-2">
                            <span className="text-black bg-[#FFC400] px-2 py-0.5 rounded-lg text-sm font-black">
                              {item.quantity}x
                            </span>
                            <span>{item.name}</span>
                          </span>
                        </div>

                        {item.specialInstructions && (
                          <div className="mt-2 p-2.5 bg-[#151515] border border-[#FFC400]/50 text-[#FFC400] text-xs rounded-xl flex items-start gap-1.5 font-bold">
                            <AlertTriangle className="w-3.5 h-3.5 text-[#FFC400] shrink-0 mt-0.5" />
                            <span>SAUCE / KITCHEN NOTE: {item.specialInstructions}</span>
                          </div>
                        )}
                      </div>
                    ))}

                    {ord.specialNotes && (
                      <div className="pt-3 text-xs text-[#A0A0A0] italic">
                        Special Ticket Note: "{ord.specialNotes}"
                      </div>
                    )}
                  </div>

                  {/* Cook Action Trigger */}
                  <div className="p-4 bg-[#181818] border-t border-[#353535]">
                    {isNew && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(ord._id, 'accepted')}
                        className="cursor-pointer w-full py-3.5 bg-[#FFC400] hover:bg-[#FFB800] text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        <Clock className="w-4 h-4 stroke-[2.5]" />
                        <span>Accept Food Order</span>
                      </button>
                    )}

                    {isAccepted && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(ord._id, 'preparing')}
                        className="cursor-pointer w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        <Flame className="w-4 h-4 stroke-[2.5]" />
                        <span>Start Frying & Cooking</span>
                      </button>
                    )}

                    {isPreparing && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(ord._id, 'ready')}
                        className="cursor-pointer w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4 stroke-[2.5]" />
                        <span>FOOD READY (Notify Waiter)</span>
                      </button>
                    )}

                    {isReady && (
                      <div className="py-3 text-center text-xs font-black uppercase text-cyan-300 bg-[#151515] rounded-xl border border-cyan-800">
                        Dishes on Plating Counter · Awaiting Server Pickup
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
