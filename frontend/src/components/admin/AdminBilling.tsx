import React, { useState, useEffect } from 'react';
import { Order } from '../../types';
import { api } from '../../services/api';
import { Printer, Search } from 'lucide-react';

export const AdminBilling: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [, setSelectedReceipt] = useState<Order | null>(null);

  const loadBilling = async () => {
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
    loadBilling();
  }, []);

  const handleConfirmCashCollection = async (orderId: string) => {
    try {
      const updated = await api.confirmPayment(orderId, 'cash');
      setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
      alert(`Payment confirmed for order ${updated.orderNumber}`);
    } catch (err: any) {
      alert(err.message || 'Error confirming payment');
    }
  };

  const handlePrintReceipt = (ord: Order) => {
    setSelectedReceipt(ord);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      (o.tableNumber && o.tableNumber.toLowerCase().includes(q))
    );
  });

  const totalCollected = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

  const pendingCollection = orders
    .filter((o) => o.paymentStatus === 'pending')
    .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#222222] p-5 rounded-2xl border border-[#353535] shadow-lg">
          <div className="text-xs text-[#D1D5DB] font-bold uppercase mb-1">Total Settled Revenue</div>
          <div className="text-2xl font-black text-[#22C55E] tabular-nums">
            PKR {totalCollected.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#A0A0A0] mt-1">Confirmed cash & card collections</div>
        </div>

        <div className="bg-[#222222] p-5 rounded-2xl border border-[#353535] shadow-lg">
          <div className="text-xs text-[#D1D5DB] font-bold uppercase mb-1">Pending Invoices / Open Tables</div>
          <div className="text-2xl font-black text-[#FFC400] tabular-nums">
            PKR {pendingCollection.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#A0A0A0] mt-1">Awaiting cash or card collection</div>
        </div>

        <div className="bg-[#222222] p-5 rounded-2xl border border-[#353535] shadow-lg">
          <div className="text-xs text-[#D1D5DB] font-bold uppercase mb-1">Standard Tax Jurisdiction</div>
          <div className="text-2xl font-black text-white">16% GST</div>
          <div className="text-[11px] text-[#A0A0A0] mt-1">Punjab Revenue Authority (PRA Kasur)</div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-[#222222] rounded-2xl border border-[#353535] shadow-lg overflow-hidden">
        <div className="p-4 border-b border-[#353535] flex justify-between items-center bg-[#181818]">
          <div className="relative w-80">
            <Search className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bill by order #, table, customer..."
              className="w-full pl-10 pr-3.5 py-2 text-xs bg-[#151515] border border-[#353535] rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#FFC400]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#181818] text-[#A0A0A0] font-black uppercase tracking-wider border-b border-[#353535]">
              <tr>
                <th className="px-5 py-3.5">Order #</th>
                <th className="px-5 py-3.5">Table / Guest</th>
                <th className="px-5 py-3.5">Subtotal</th>
                <th className="px-5 py-3.5">16% GST</th>
                <th className="px-5 py-3.5">Grand Total</th>
                <th className="px-5 py-3.5">Payment Status</th>
                <th className="px-5 py-3.5">Collected By</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#353535] text-[#D1D5DB]">
              {filtered.map((ord) => (
                <tr key={ord._id} className="hover:bg-[#282828] transition-colors">
                  <td className="px-5 py-3.5 font-bold text-white">{ord.orderNumber}</td>

                  <td className="px-5 py-3.5">
                    <div className="font-bold text-white">{ord.customerName}</div>
                    <div className="text-[11px] text-[#FFC400]">
                      {ord.orderType === 'dine_in' ? `Table ${ord.tableNumber}` : 'Kasur Delivery'}
                    </div>
                  </td>

                  <td className="px-5 py-3.5 tabular-nums text-white">
                    PKR {ord.subtotal.toLocaleString()}
                  </td>

                  <td className="px-5 py-3.5 tabular-nums text-[#A0A0A0]">
                    PKR {ord.tax.toLocaleString()}
                  </td>

                  <td className="px-5 py-3.5 font-black text-[#FFC400] tabular-nums">
                    PKR {ord.grandTotal.toLocaleString()}
                  </td>

                  <td className="px-5 py-3.5">
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border ${
                        ord.paymentStatus === 'paid'
                          ? 'bg-[#151515] border-[#22C55E] text-[#22C55E]'
                          : 'bg-[#151515] border-[#FFC400] text-[#FFC400]'
                      }`}
                    >
                      {ord.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'} ({ord.paymentMethod})
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-[#A0A0A0]">
                    {ord.confirmedBy || (ord.paymentStatus === 'paid' ? 'Cashier / Admin' : '—')}
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {ord.paymentStatus === 'pending' && (
                        <button
                          type="button"
                          onClick={() => handleConfirmCashCollection(ord._id)}
                          className="cursor-pointer px-3 py-1.5 bg-[#22C55E] hover:bg-emerald-400 text-black font-black uppercase rounded-lg text-[10px] shadow-sm"
                        >
                          Confirm Cash
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handlePrintReceipt(ord)}
                        className="cursor-pointer p-2 text-[#D1D5DB] hover:text-[#FFC400] bg-[#151515] hover:bg-[#2d2d2d] rounded-xl border border-[#353535] transition-colors"
                        title="Print Invoice / Slip"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
