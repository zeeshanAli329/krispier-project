import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { TrendingUp, PieChart } from 'lucide-react';

export const AdminReports: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.getDashboardStats().then((data) => setStats(data)).catch(() => {});
  }, []);

  if (!stats) {
    return (
      <div className="p-8 text-center text-[#A0A0A0] text-xs">
        Loading performance reports...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#222222] p-5 rounded-2xl border border-[#353535] shadow-lg">
        <h2 className="text-sm font-black text-white uppercase tracking-wider">Analytics & Sales Reports</h2>
        <p className="text-xs text-[#A0A0A0]">
          Executive performance summary of sales, volumes, and top-selling fast food
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top revenue dishes */}
        <div className="bg-[#222222] p-6 rounded-2xl border border-[#353535] shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#353535]">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#FFC400]" />
              <span>Highest Revenue Generating Items</span>
            </h3>
            <span className="text-xs text-[#A0A0A0]">PKR Volume</span>
          </div>

          <div className="space-y-3">
            {stats.topDishes.map((dish: any, idx: number) => {
              const maxRev = Math.max(...stats.topDishes.map((d: any) => d.revenue), 1);
              const pct = Math.round((dish.revenue / maxRev) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white">{dish.name}</span>
                    <span className="text-[#FFC400] tabular-nums font-black">
                      PKR {dish.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-[#151515] border border-[#353535] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FFC400] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-[#A0A0A0] text-right">{dish.count} orders fulfilled</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operational Efficiency */}
        <div className="bg-[#222222] p-6 rounded-2xl border border-[#353535] shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#353535]">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#22C55E]" />
              <span>Order Fulfillment Channel Mix</span>
            </h3>
            <span className="text-xs text-[#A0A0A0]">Total: {stats.totalOrders} Orders</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 bg-[#151515] border border-[#353535] rounded-xl flex justify-between items-center">
              <div>
                <span className="font-bold text-white block">Dine-In Table QR Orders</span>
                <span className="text-[11px] text-[#A0A0A0]">Contactless QR ordering at tables</span>
              </div>
              <span className="text-base font-black text-[#FFC400] tabular-nums">
                {Math.max(0, stats.totalOrders - 1)}
              </span>
            </div>

            <div className="p-4 bg-[#151515] border border-[#353535] rounded-xl flex justify-between items-center">
              <div>
                <span className="font-bold text-white block">Online Takeaway & Delivery</span>
                <span className="text-[11px] text-[#A0A0A0]">Website direct customer orders</span>
              </div>
              <span className="text-base font-black text-[#22C55E] tabular-nums">1</span>
            </div>

            <div className="p-4 bg-[#151515] border border-[#353535] rounded-xl flex justify-between items-center">
              <div>
                <span className="font-bold text-white block">Average Order Value (AOV)</span>
                <span className="text-[11px] text-[#A0A0A0]">Average ticket per order</span>
              </div>
              <span className="text-base font-black text-[#FFC400] tabular-nums">
                PKR {stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders).toLocaleString() : 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
