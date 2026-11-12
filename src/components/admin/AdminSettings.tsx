import React, { useState, useEffect } from 'react';
import { RestaurantSettings } from '../../types';
import { api } from '../../services/api';
import { Save, CheckCircle2 } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<RestaurantSettings>({
    restaurantName: 'KRISPIER Fast Food',
    tagline: 'Delight In Every Sauce',
    currency: 'PKR',
    taxRate: 16,
    deliveryFee: 150,
    phone: '+92 300 4882200',
    email: 'orders@krispier.pk',
    address: 'Main Ferozepur Road, Opposite Sports Stadium, Kasur, Pakistan',
    openingHours: 'Monday – Sunday: 01:00 PM – 02:00 AM (Daily)',
    isOpen: true,
  });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getSettings().then((data) => setSettings(data)).catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateSettings(settings);
      setSettings(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      alert(err.message || 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-[#222222] p-5 rounded-2xl border border-[#353535] shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-wider">Krispier Business Settings</h2>
          <p className="text-xs text-[#A0A0A0]">
            Configure branch branding, PRA tax rate, kitchen timings, and Kasur hotline
          </p>
        </div>
        {savedSuccess && (
          <span className="flex items-center gap-1.5 text-xs font-black uppercase text-[#22C55E] bg-[#151515] px-3.5 py-1.5 rounded-xl border border-[#22C55E]">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved</span>
          </span>
        )}
      </div>

      <div className="bg-[#222222] rounded-2xl border border-[#353535] shadow-lg p-6">
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#D1D5DB] mb-1">Restaurant Brand Name</label>
              <input
                type="text"
                required
                value={settings.restaurantName}
                onChange={(e) => setSettings({ ...settings, restaurantName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#151515] border border-[#353535] rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#FFC400]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#D1D5DB] mb-1">Currency Code</label>
              <input
                type="text"
                disabled
                value={settings.currency}
                className="w-full px-3.5 py-2.5 bg-[#111111] border border-[#353535] rounded-xl text-[#888888] cursor-not-allowed font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#D1D5DB] mb-1">Official Brand Tagline</label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#151515] border border-[#353535] rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#FFC400]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#D1D5DB] mb-1">Sales Tax Rate (%)</label>
              <input
                type="number"
                min={0}
                max={50}
                value={settings.taxRate}
                onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-[#151515] border border-[#353535] rounded-xl text-white focus:outline-none focus:border-[#FFC400]"
              />
              <span className="text-[10px] text-[#A0A0A0] mt-0.5 block">Applied to dine-in and delivery orders.</span>
            </div>

            <div>
              <label className="block font-semibold text-[#D1D5DB] mb-1">Kasur City Delivery Fee (PKR)</label>
              <input
                type="number"
                min={0}
                value={settings.deliveryFee}
                onChange={(e) => setSettings({ ...settings, deliveryFee: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-[#151515] border border-[#353535] rounded-xl text-white focus:outline-none focus:border-[#FFC400]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#D1D5DB] mb-1">Customer Helpline / Phone</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#151515] border border-[#353535] rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#FFC400]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#D1D5DB] mb-1">Contact Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#151515] border border-[#353535] rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#FFC400]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#D1D5DB] mb-1">Physical Restaurant Address</label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#151515] border border-[#353535] rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#FFC400]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#D1D5DB] mb-1">Opening Hours</label>
            <input
              type="text"
              value={settings.openingHours}
              onChange={(e) => setSettings({ ...settings, openingHours: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#151515] border border-[#353535] rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#FFC400]"
            />
          </div>

          <div className="pt-4 border-t border-[#353535] flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-[#FFC400] hover:bg-[#FFB800] text-black font-black uppercase tracking-wider rounded-xl shadow-md transition-all"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
