import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Order } from '../../types';
import { api } from '../../services/api';
import { subscribeToEvent } from '../../services/socket';
import { KrispierLogo } from '../common/KrispierLogo';
import {
  Phone,
  MapPin,
  CheckCircle,
  PackageCheck,
  LogOut,
} from 'lucide-react';

export const DeliveryDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [, setLoading] = useState(true);

  const loadDeliveries = async () => {
    try {
      const data = await api.getOrders({ type: 'delivery' });
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();

    const unsubNew = subscribeToEvent<Order>('order:new', () => loadDeliveries());
    const unsubUpd = subscribeToEvent<Order>('order:updated', () => loadDeliveries());

    return () => {
      unsubNew();
      unsubUpd();
    };
  }, []);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await api.updateOrderStatus(orderId, status, { deliveryBoyId: user?.id });
      loadDeliveries();
    } catch (err: any) {
      alert(err.message || 'Error updating delivery status');
    }
  };

  const pendingDeliveries = orders.filter((o) =>
    ['new', 'accepted', 'preparing', 'ready'].includes(o.status)
  );

  return (
    <div className="min-h-screen bg-[#151515] text-[#D1D5DB] flex flex-col font-sans selection:bg-[#FFC400] selection:text-black">
      <header className="bg-[#222222] text-white px-6 py-4 flex items-center justify-between border-b border-[#353535] sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <KrispierLogo size="sm" />
          <div className="border-l border-[#353535] pl-4">
            <div className="font-black text-sm uppercase text-white tracking-wider">Kasur Express Delivery</div>
            <div className="text-[11px] text-[#22C55E] font-bold">Rider: {user?.name || 'Rider'} · Active Dispatch</div>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="cursor-pointer flex items-center gap-1.5 px-3.5 py-2 bg-[#151515] hover:bg-[#EF4444] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors border border-[#353535]"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </header>

      <main className="p-6 max-w-5xl mx-auto w-full flex-1 space-y-6">
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-wider mb-1">Assigned Kasur Delivery Parcels</h2>
          <p className="text-xs text-[#A0A0A0]">Contact customer directly and deliver hot & crispy</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingDeliveries.length === 0 ? (
            <div className="col-span-2 bg-[#222222] rounded-2xl border border-[#353535] p-12 text-center text-[#A0A0A0] space-y-2">
              <CheckCircle className="w-10 h-10 text-[#22C55E] mx-auto" />
              <h3 className="font-black text-white text-sm uppercase tracking-wider">No Pending Deliveries</h3>
              <p className="text-xs">All Krispier doorstep orders in Kasur have been fulfilled!</p>
            </div>
          ) : (
            pendingDeliveries.map((ord) => (
              <div
                key={ord._id}
                className="bg-[#222222] rounded-2xl border border-[#353535] hover:border-[#FFC400] shadow-lg p-6 flex flex-col justify-between space-y-4 transition-all"
              >
                <div>
                  <div className="flex justify-between items-start pb-3 border-b border-[#353535]">
                    <div>
                      <span className="text-base font-black text-white">{ord.orderNumber}</span>
                      <div className="text-xs text-[#A0A0A0]">{ord.customerName}</div>
                    </div>
                    <span className="bg-[#151515] border border-[#FFC400] text-[#FFC400] text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">
                      {ord.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3 text-xs text-[#D1D5DB]">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-[#FFC400] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-white">Delivery Address:</span>
                        <span className="text-[#D1D5DB]">{ord.deliveryAddress || 'Address on file'}</span>
                      </div>
                    </div>

                    {ord.customerPhone && (
                      <div className="flex items-center gap-2.5">
                        <Phone className="w-4 h-4 text-[#22C55E] shrink-0" />
                        <a
                          href={`tel:${ord.customerPhone}`}
                          className="cursor-pointer font-bold text-[#FFC400] hover:underline"
                        >
                          {ord.customerPhone} (Click to Call)
                        </a>
                      </div>
                    )}

                    <div className="pt-2 border-t border-[#353535]">
                      <span className="font-bold text-white block mb-1">Ordered Fast Food:</span>
                      <ul className="space-y-1 text-[#A0A0A0]">
                        {ord.items.map((item, idx) => (
                          <li key={idx} className="flex justify-between">
                            <span>• {item.quantity}x {item.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 flex justify-between font-black text-white text-sm border-t border-[#353535]">
                      <span>Collect Cash on Delivery:</span>
                      <span className="text-[#FFC400] tabular-nums">
                        PKR {ord.grandTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#353535]">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(ord._id, 'delivered')}
                    className="cursor-pointer w-full py-3.5 bg-[#22C55E] hover:bg-emerald-400 text-black font-black uppercase tracking-wider text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
                  >
                    <PackageCheck className="w-4 h-4 stroke-[2.5]" />
                    <span>Confirm Handover & Mark DELIVERED</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};
