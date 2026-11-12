import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Order, TableItem } from '../../types';
import { api } from '../../services/api';
import { subscribeToEvent } from '../../services/socket';
import { KrispierLogo } from '../common/KrispierLogo';
import {
  UtensilsCrossed,
  CheckCircle,
  Receipt,
  LogOut,
  Clock,
  Flame,
  Grid,
} from 'lucide-react';

export const WaiterDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<TableItem[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'ready' | 'tables' | 'billing'>('ready');
  const [, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [ordList, tblList] = await Promise.all([
        api.getOrders(),
        api.getTables(),
      ]);
      setOrders(ordList);
      setTables(tblList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const unsubNew = subscribeToEvent<Order>('order:new', () => loadData());
    const unsubUpd = subscribeToEvent<Order>('order:updated', () => loadData());
    const unsubWaiter = subscribeToEvent('waiter:called', (data: any) => {
      alert(`🔔 Krispier Waiter Call from Table ${data.tableNumber}: ${data.reason || 'Guest assistance requested'}`);
      loadData();
    });

    return () => {
      unsubNew();
      unsubUpd();
    };
  }, []);

  const handleServeOrder = async (orderId: string) => {
    try {
      await api.updateOrderStatus(orderId, 'served');
    } catch (err: any) {
      alert(err.message || 'Error marking served');
    }
  };

  const handleCollectCash = async (orderId: string) => {
    try {
      await api.confirmPayment(orderId, 'cash');
      alert('Cash payment confirmed and recorded.');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error collecting cash');
    }
  };

  // Ready orders waiting for waiter pickup
  const readyOrders = orders.filter((o) => o.status === 'ready' && o.orderType === 'dine_in');
  const newAndPreparing = orders.filter((o) => ['new', 'accepted', 'preparing'].includes(o.status));
  const myAssignedTables = user?.assignedTables || [];

  return (
    <div className="min-h-screen bg-[#151515] text-[#D1D5DB] flex flex-col font-sans selection:bg-[#FFC400] selection:text-black">
      {/* Waiter Top Bar */}
      <header className="bg-[#222222] text-white px-6 py-4 flex items-center justify-between border-b border-[#353535] sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <KrispierLogo size="sm" />
          <div className="border-l border-[#353535] pl-4">
            <div className="font-black text-sm uppercase text-white tracking-wider">Waiter Service Station</div>
            <div className="text-[11px] text-[#FFC400] font-bold">
              Server: {user?.name} · Duty: {myAssignedTables.length > 0 ? myAssignedTables.join(', ') : 'All Kasur Tables'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {readyOrders.length > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#151515] text-[#FFC400] border border-[#FFC400] text-xs font-black uppercase rounded-xl animate-pulse">
              <Flame className="w-3.5 h-3.5 fill-[#FFC400] text-[#FFC400]" />
              <span>{readyOrders.length} Order(s) READY for service!</span>
            </span>
          )}

          <button
            type="button"
            onClick={logout}
            className="cursor-pointer flex items-center gap-1.5 px-3.5 py-2 bg-[#151515] hover:bg-[#EF4444] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors border border-[#353535]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-[#1c1c1c] border-b border-[#353535] px-6 py-3 flex items-center gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('ready')}
          className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
            activeTab === 'ready'
              ? 'bg-[#FFC400] text-black shadow-md'
              : 'text-[#D1D5DB] hover:text-white hover:bg-[#222222]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Ready to Serve ({readyOrders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
            activeTab === 'orders'
              ? 'bg-[#FFC400] text-black shadow-md'
              : 'text-[#D1D5DB] hover:text-white hover:bg-[#222222]'
          }`}
        >
          <UtensilsCrossed className="w-3.5 h-3.5" />
          <span>Kitchen Orders ({newAndPreparing.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tables')}
          className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
            activeTab === 'tables'
              ? 'bg-[#FFC400] text-black shadow-md'
              : 'text-[#D1D5DB] hover:text-white hover:bg-[#222222]'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>My Dining Tables ({tables.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('billing')}
          className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
            activeTab === 'billing'
              ? 'bg-[#FFC400] text-black shadow-md'
              : 'text-[#D1D5DB] hover:text-white hover:bg-[#222222]'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Table Billing & Payments</span>
        </button>
      </div>

      {/* Main View */}
      <main className="p-6 max-w-7xl mx-auto w-full flex-1">
        {/* Tab 1: Ready to Serve */}
        {activeTab === 'ready' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                Dishes Freshly Fried & Waiting for Table Service
              </h2>
              <span className="text-xs text-[#FFC400] font-bold">Pick up from fryer counter immediately</span>
            </div>

            {readyOrders.length === 0 ? (
              <div className="bg-[#222222] rounded-2xl border border-[#353535] p-12 text-center text-[#A0A0A0] space-y-2">
                <CheckCircle className="w-10 h-10 text-[#22C55E] mx-auto" />
                <h3 className="font-black text-white text-sm uppercase tracking-wider">All Caught Up!</h3>
                <p className="text-xs">No orders are waiting for table service right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {readyOrders.map((ord) => (
                  <div
                    key={ord._id}
                    className="bg-[#222222] rounded-2xl border-2 border-[#FFC400] shadow-xl p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-2xl font-black text-[#FFC400]">
                          Table {ord.tableNumber}
                        </span>
                        <span className="bg-[#151515] border border-cyan-500 text-cyan-400 text-xs font-black uppercase px-2.5 py-1 rounded-lg">
                          FOOD READY
                        </span>
                      </div>

                      <div className="text-xs text-[#A0A0A0] mb-2 font-mono">Order {ord.orderNumber}</div>

                      <div className="divide-y divide-[#353535] border-t border-b border-[#353535] py-2 space-y-1 my-3">
                        {ord.items.map((i, idx) => (
                          <div key={idx} className="flex justify-between text-xs pt-1">
                            <span className="font-bold text-white">
                              {i.quantity}x {i.name}
                            </span>
                            {i.specialInstructions && (
                              <span className="text-[10px] text-[#FFC400] italic">
                                ({i.specialInstructions})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleServeOrder(ord._id)}
                      className="cursor-pointer w-full py-3.5 bg-[#22C55E] hover:bg-emerald-400 text-black font-black uppercase tracking-wider text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4 stroke-[2.5]" />
                      <span>Mark Dishes SERVED to Table {ord.tableNumber}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Kitchen Orders */}
        {activeTab === 'orders' && (
          <div className="bg-[#222222] rounded-2xl border border-[#353535] shadow-lg p-6 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Active Kitchen Orders</h3>
            <div className="divide-y divide-[#353535]">
              {newAndPreparing.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#888888]">
                  No orders currently in fryers/ovens.
                </div>
              ) : (
                newAndPreparing.map((ord) => (
                  <div key={ord._id} className="py-4 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-white text-sm">
                        {ord.orderNumber} · Table {ord.tableNumber || 'Takeaway'}
                      </div>
                      <div className="text-[#A0A0A0] mt-1">
                        {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="capitalize font-black text-[10px] uppercase text-[#FFC400] bg-[#151515] border border-[#FFC400] px-2.5 py-1 rounded-lg">
                        {ord.status}
                      </span>
                      <div className="text-[11px] text-[#FFC400] font-black mt-1 tabular-nums">
                        PKR {ord.grandTotal.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Dining Tables */}
        {activeTab === 'tables' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {tables.map((t) => (
              <div
                key={t._id}
                className={`p-5 rounded-2xl border ${
                  t.status === 'occupied'
                    ? 'bg-[#222222] border-[#EF4444] text-[#EF4444]'
                    : 'bg-[#222222] border-[#353535] text-white'
                } shadow-lg flex flex-col justify-between`}
              >
                <div>
                  <div className="text-2xl font-black text-white">{t.tableNumber}</div>
                  <div className="text-xs font-bold text-[#D1D5DB] mt-1">{t.name}</div>
                  <div className="text-[11px] text-[#A0A0A0]">{t.location} · {t.capacity} Guests</div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#353535] flex justify-between items-center text-xs font-black uppercase">
                  <span className={t.status === 'occupied' ? 'text-[#EF4444]' : 'text-[#22C55E]'}>{t.status}</span>
                  {t.currentOrderId && <span className="text-[#FFC400]">{t.currentOrderId}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Billing */}
        {activeTab === 'billing' && (
          <div className="bg-[#222222] rounded-2xl border border-[#353535] shadow-lg p-6 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Table Invoices & Cash Settlement</h3>
            <div className="divide-y divide-[#353535]">
              {orders
                .filter((o) => o.orderType === 'dine_in')
                .slice(0, 15)
                .map((ord) => (
                  <div key={ord._id} className="py-4 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-white">
                        {ord.orderNumber} · Table {ord.tableNumber}
                      </div>
                      <div className="text-[#A0A0A0] mt-0.5">
                        PKR {ord.grandTotal.toLocaleString()} ({ord.items.length} items, incl. 16% GST)
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {ord.paymentStatus === 'paid' ? (
                        <span className="text-[#22C55E] font-black uppercase bg-[#151515] border border-[#22C55E] px-2.5 py-1 rounded-lg">
                          Settled (Paid)
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleCollectCash(ord._id)}
                          className="cursor-pointer px-4 py-2 bg-[#22C55E] hover:bg-emerald-400 text-black font-black uppercase rounded-xl shadow-md"
                        >
                          Collect Cash PKR {ord.grandTotal.toLocaleString()}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
