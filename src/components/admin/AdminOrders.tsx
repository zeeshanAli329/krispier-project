import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../../types';
import { api } from '../../services/api';
import { subscribeToEvent } from '../../services/socket';
import {
  Search,
  Printer,
  X,
  Eye,
} from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const data = await api.getOrders({ status: statusFilter !== 'all' ? statusFilter : undefined });
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const unsubNew = subscribeToEvent<Order>('order:new', (newOrd) => {
      setOrders((prev) => [newOrd, ...prev]);
    });
    const unsubUpd = subscribeToEvent<Order>('order:updated', (updOrd) => {
      setOrders((prev) => prev.map((o) => (o._id === updOrd._id ? updOrd : o)));
      if (selectedOrder && selectedOrder._id === updOrd._id) {
        setSelectedOrder(updOrd);
      }
    });

    return () => {
      unsubNew();
      unsubUpd();
    };
  }, [statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const handlePrintSlip = () => {
    window.print();
  };

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      (o.tableNumber && o.tableNumber.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top filter & Search bar */}
      <div className="bg-[#222222] p-4 rounded-2xl border border-[#353535] shadow-lg flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, guest, or table..."
            className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#151515] border border-[#353535] rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#FFC400]"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {['all', 'new', 'accepted', 'preparing', 'ready', 'served', 'delivered'].map((st) => (
            <button
              type="button"
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`cursor-pointer px-3.5 py-2 text-xs font-black uppercase tracking-wider rounded-xl whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-[#FFC400] text-black shadow-md'
                  : 'bg-[#151515] text-[#D1D5DB] hover:text-white hover:bg-[#2d2d2d] border border-[#353535]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#222222] rounded-2xl border border-[#353535] shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#181818] text-[#A0A0A0] font-black uppercase tracking-wider border-b border-[#353535]">
              <tr>
                <th className="px-5 py-3.5">Order No</th>
                <th className="px-5 py-3.5">Type / Destination</th>
                <th className="px-5 py-3.5">Items & Qty</th>
                <th className="px-5 py-3.5">Grand Total</th>
                <th className="px-5 py-3.5">Workflow Status</th>
                <th className="px-5 py-3.5">Payment</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#353535] text-[#D1D5DB]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-[#888888]">
                    Loading orders...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-[#888888]">
                    No orders match this criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((ord) => (
                  <tr key={ord._id} className="hover:bg-[#282828] transition-colors">
                    <td className="px-5 py-3.5 font-bold text-white">
                      <div>{ord.orderNumber}</div>
                      <div className="text-[10px] text-[#A0A0A0]">
                        {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="font-bold text-white">{ord.customerName}</div>
                      <div className="text-[11px] text-[#FFC400] font-bold">
                        {ord.orderType === 'dine_in' ? `Table ${ord.tableNumber}` : ord.orderType.toUpperCase()}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="font-bold text-white">{ord.items.length} items</span>
                      <div className="text-[10px] text-[#A0A0A0] line-clamp-1">
                        {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 font-black text-[#FFC400] tabular-nums">
                      PKR {ord.grandTotal.toLocaleString()}
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`capitalize font-bold text-[10px] px-2.5 py-1 rounded-lg uppercase inline-block ${
                          ord.status === 'ready'
                            ? 'bg-[#151515] border border-cyan-500 text-cyan-400'
                            : ord.status === 'preparing'
                            ? 'bg-[#151515] border border-[#FFC400] text-[#FFC400]'
                            : ord.status === 'served'
                            ? 'bg-[#151515] border border-[#22C55E] text-[#22C55E]'
                            : ord.status === 'delivered'
                            ? 'bg-[#151515] border border-teal-500 text-teal-400'
                            : 'bg-[#151515] border border-[#353535] text-[#D1D5DB]'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="text-[11px] font-bold">
                        {ord.paymentStatus === 'paid' ? (
                          <span className="text-[#22C55E]">Paid ({ord.paymentMethod})</span>
                        ) : (
                          <span className="text-[#FFC400]">Pending ({ord.paymentMethod})</span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(ord)}
                          className="cursor-pointer p-2 bg-[#151515] hover:bg-[#FFC400] hover:text-black text-[#D1D5DB] rounded-xl transition-all border border-[#353535]"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Quick status stepper button */}
                        {ord.status === 'new' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(ord._id, 'accepted')}
                            className="cursor-pointer px-2.5 py-1.5 bg-[#FFC400] hover:bg-[#FFB800] text-black font-black uppercase text-[10px] rounded-lg shadow-sm"
                          >
                            Accept
                          </button>
                        )}
                        {ord.status === 'accepted' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(ord._id, 'preparing')}
                            className="cursor-pointer px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-[10px] rounded-lg shadow-sm"
                          >
                            Fry
                          </button>
                        )}
                        {ord.status === 'preparing' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(ord._id, 'ready')}
                            className="cursor-pointer px-2.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase text-[10px] rounded-lg shadow-sm"
                          >
                            Ready
                          </button>
                        )}
                        {ord.status === 'ready' && ord.orderType === 'dine_in' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(ord._id, 'served')}
                            className="cursor-pointer px-2.5 py-1.5 bg-[#22C55E] hover:bg-emerald-400 text-black font-black uppercase text-[10px] rounded-lg shadow-sm"
                          >
                            Served
                          </button>
                        )}
                        {ord.status === 'ready' && ord.orderType === 'delivery' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(ord._id, 'delivered')}
                            className="cursor-pointer px-2.5 py-1.5 bg-[#22C55E] hover:bg-emerald-400 text-black font-black uppercase text-[10px] rounded-lg shadow-sm"
                          >
                            Delivered
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#222222] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#353535] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#353535]">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider">
                  Order Details: {selectedOrder.orderNumber}
                </h3>
                <span className="text-xs text-[#A0A0A0]">
                  Placed at {new Date(selectedOrder.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="cursor-pointer p-1 rounded-lg text-[#A0A0A0] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Destination info */}
            <div className="p-4 bg-[#151515] border border-[#353535] rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#A0A0A0]">Destination:</span>
                <span className="font-bold text-[#FFC400]">
                  {selectedOrder.orderType === 'dine_in'
                    ? `Table ${selectedOrder.tableNumber}`
                    : `Kasur Home Delivery`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A0A0A0]">Guest Name:</span>
                <span className="font-bold text-white">{selectedOrder.customerName}</span>
              </div>
              {selectedOrder.customerPhone && (
                <div className="flex justify-between">
                  <span className="text-[#A0A0A0]">Phone:</span>
                  <span className="text-white">{selectedOrder.customerPhone}</span>
                </div>
              )}
              {selectedOrder.deliveryAddress && (
                <div className="flex justify-between">
                  <span className="text-[#A0A0A0]">Address:</span>
                  <span className="text-white">{selectedOrder.deliveryAddress}</span>
                </div>
              )}
              {selectedOrder.specialNotes && (
                <div className="pt-1 text-[#FFC400] font-semibold">
                  Note: {selectedOrder.specialNotes}
                </div>
              )}
            </div>

            {/* Itemized dishes */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                Dishes Ordered
              </h4>
              <div className="divide-y divide-[#353535]">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex justify-between items-start text-xs">
                    <div>
                      <div className="font-bold text-white">
                        {item.quantity}x {item.name}
                      </div>
                      {item.specialInstructions && (
                        <div className="text-[11px] text-[#FFC400] italic">
                          "{item.specialInstructions}"
                        </div>
                      )}
                    </div>
                    <div className="font-black text-[#FFC400] tabular-nums">
                      PKR {(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Calculations */}
            <div className="pt-3 border-t border-[#353535] space-y-1.5 text-xs">
              <div className="flex justify-between text-[#A0A0A0]">
                <span>Subtotal</span>
                <span className="tabular-nums text-white">PKR {selectedOrder.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#A0A0A0]">
                <span>Tax (16% GST)</span>
                <span className="tabular-nums text-white">PKR {selectedOrder.tax.toLocaleString()}</span>
              </div>
              {selectedOrder.deliveryFee > 0 && (
                <div className="flex justify-between text-[#A0A0A0]">
                  <span>Delivery Fee</span>
                  <span className="tabular-nums text-white">PKR {selectedOrder.deliveryFee.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-[#353535]">
                <span>Grand Total</span>
                <span className="tabular-nums text-[#FFC400]">
                  PKR {selectedOrder.grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handlePrintSlip}
                className="cursor-pointer flex items-center gap-1.5 px-4 py-2.5 bg-[#151515] hover:bg-[#FFC400] hover:text-black text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all border border-[#353535]"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Kitchen Slip</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="cursor-pointer px-6 py-2.5 bg-[#FFC400] hover:bg-[#FFB800] text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
