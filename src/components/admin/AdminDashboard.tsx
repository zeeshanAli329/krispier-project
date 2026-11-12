import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Order } from '../../types';
import { subscribeToEvent } from '../../services/socket';
import {
  ShoppingBag,
  Clock,
  Flame,
  CheckCircle,
  Utensils,
  DollarSign,
  Grid,
  Layers,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    newOrders: 0,
    preparingOrders: 0,
    readyOrders: 0,
    servedOrders: 0,
    totalRevenue: 0,
    activeTables: 0,
    availableTables: 0,
    topDishes: [] as Array<{ name: string; count: number; revenue: number }>,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      const [dashStats, orderList] = await Promise.all([
        api.getDashboardStats(),
        api.getOrders(),
      ]);
      setStats(dashStats);
      setRecentOrders(orderList.slice(0, 7));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Socket subscriptions for instant dashboard updates
    const unsubNewOrder = subscribeToEvent('order:new', () => loadDashboardData());
    const unsubUpdateOrder = subscribeToEvent('order:updated', () => loadDashboardData());
    const unsubTable = subscribeToEvent('tables:updated', () => loadDashboardData());

    return () => {
      unsubNewOrder();
      unsubUpdateOrder();
      unsubTable();
    };
  }, []);

  const kpis = [
    {
      title: 'Total Revenue',
      value: `PKR ${stats.totalRevenue.toLocaleString()}`,
      sub: 'All confirmed payments',
      icon: DollarSign,
      color: 'bg-[#151515] text-[#FFC400] border-[#353535]',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      sub: 'Lifetime order volume',
      icon: ShoppingBag,
      color: 'bg-[#151515] text-[#FFC400] border-[#353535]',
    },
    {
      title: 'New Orders',
      value: stats.newOrders,
      sub: 'Awaiting fryer queue',
      icon: Clock,
      color: 'bg-[#151515] text-[#FFC400] border-[#353535]',
    },
    {
      title: 'Frying Orders',
      value: stats.preparingOrders,
      sub: 'Currently in fryers/ovens',
      icon: Flame,
      color: 'bg-[#151515] text-[#FFC400] border-[#353535]',
    },
    {
      title: 'Ready Orders',
      value: stats.readyOrders,
      sub: 'Awaiting server pickup',
      icon: CheckCircle,
      color: 'bg-[#151515] text-[#22C55E] border-[#353535]',
    },
    {
      title: 'Served Orders',
      value: stats.servedOrders,
      sub: 'Completed dining & delivered',
      icon: Utensils,
      color: 'bg-[#151515] text-[#22C55E] border-[#353535]',
    },
    {
      title: 'Active Tables',
      value: stats.activeTables,
      sub: 'Currently dining guests',
      icon: Grid,
      color: 'bg-[#151515] text-[#FFC400] border-[#353535]',
    },
    {
      title: 'Available Tables',
      value: stats.availableTables,
      sub: 'Ready for new guests',
      icon: Layers,
      color: 'bg-[#151515] text-[#D1D5DB] border-[#353535]',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-[#FFC400] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 8 KPI Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-black text-white uppercase tracking-wider">Operational Overview</h2>
          <span className="text-xs text-[#FFC400] font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
            <span>Live Kasur Sync</span>
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div
                key={idx}
                className="bg-[#222222] p-5 rounded-2xl border border-[#353535] hover:border-[#FFC400] transition-all flex flex-col justify-between shadow-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#D1D5DB] uppercase">{kpi.title}</span>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${kpi.color}`}>
                    <Icon className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white tabular-nums">{kpi.value}</div>
                  <div className="text-[11px] text-[#A0A0A0] mt-1">{kpi.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Split section: Recent Orders Table & Top Selling Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders (8 cols) */}
        <div className="lg:col-span-8 bg-[#222222] rounded-2xl border border-[#353535] shadow-lg overflow-hidden">
          <div className="p-5 border-b border-[#353535] flex items-center justify-between bg-[#1f1f1f]">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Recent Fast-Food Orders</h3>
              <p className="text-xs text-[#A0A0A0]">Live stream of incoming table, takeaway & delivery requests</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('orders')}
              className="cursor-pointer text-xs font-bold text-[#FFC400] hover:text-[#FFB800] flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#181818] text-[#A0A0A0] font-black uppercase tracking-wider border-b border-[#353535]">
                <tr>
                  <th className="px-5 py-3.5">Order</th>
                  <th className="px-5 py-3.5">Customer / Table</th>
                  <th className="px-5 py-3.5">Dishes</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#353535] text-[#D1D5DB]">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-[#888888]">
                      No orders recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((ord) => (
                    <tr key={ord._id} className="hover:bg-[#282828] transition-colors">
                      <td className="px-5 py-3.5 font-bold text-white">{ord.orderNumber}</td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-white">{ord.customerName}</div>
                        <div className="text-[11px] text-[#A0A0A0]">
                          {ord.orderType === 'dine_in'
                            ? `Table ${ord.tableNumber}`
                            : ord.orderType.toUpperCase()}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[#FFC400] font-bold">{ord.items.length} item(s)</span>
                        <div className="text-[10px] text-[#A0A0A0] truncate max-w-[150px]">
                          {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-black text-white tabular-nums">
                        PKR {ord.grandTotal.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`capitalize font-bold text-[10px] px-2.5 py-1 rounded-lg uppercase ${
                            ord.status === 'ready'
                              ? 'bg-[#151515] border border-cyan-500 text-cyan-400'
                              : ord.status === 'preparing'
                              ? 'bg-[#151515] border border-[#FFC400] text-[#FFC400]'
                              : ord.status === 'served'
                              ? 'bg-[#151515] border border-[#22C55E] text-[#22C55E]'
                              : 'bg-[#151515] border border-[#353535] text-[#D1D5DB]'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-[11px] font-bold ${
                            ord.paymentStatus === 'paid' ? 'text-[#22C55E]' : 'text-[#FFC400]'
                          }`}
                        >
                          {ord.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Culinary Dishes (4 cols) */}
        <div className="lg:col-span-4 bg-[#222222] rounded-2xl border border-[#353535] shadow-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#353535] mb-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#FFC400]" />
                <span>Top Fast-Food Craves</span>
              </h3>
              <span className="text-xs text-[#A0A0A0]">By Volume</span>
            </div>

            <div className="space-y-4">
              {stats.topDishes.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#888888]">
                  Sales metrics accumulate as orders are fulfilled.
                </div>
              ) : (
                stats.topDishes.map((dish, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="w-6 h-6 rounded-lg bg-[#151515] border border-[#353535] font-black text-[#FFC400] flex items-center justify-center text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-white truncate">{dish.name}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-[#FFC400]">{dish.count} orders</div>
                      <div className="text-[10px] text-[#A0A0A0] tabular-nums">
                        PKR {dish.revenue.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#353535] mt-6">
            <button
              type="button"
              onClick={() => onNavigateTab('food_menu')}
              className="cursor-pointer w-full py-2.5 bg-[#151515] hover:bg-[#FFC400] text-[#D1D5DB] hover:text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all border border-[#353535]"
            >
              Manage Full Menu Catalog
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
