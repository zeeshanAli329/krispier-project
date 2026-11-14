import React, { useState } from 'react';
import { Users, Clock, CheckCircle2 } from 'lucide-react';

export const ReservationSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    guests: '2 Guests',
    date: '2026-11-13',
    time: '19:30',
    occasion: 'Fast Food Feast',
    notes: '',
  });
  const [confirmed, setConfirmed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    setConfirmed(true);
  };

  return (
    <section id="reservation" className="py-24 bg-[#151515] text-white border-b border-[#353535]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="text-xs font-bold tracking-widest uppercase text-[#FFC400] mb-2 flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FFC400]"></span>
            <span>Family & Party Hall Dining</span>
            <span className="w-2 h-2 rounded-full bg-[#FFC400]"></span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            Book Table At Krispier Kasur
          </h2>
          <p className="text-[#D1D5DB] mt-3 text-base">
            Reserve a family booth or birthday party area at our Main Ferozepur Road branch.
          </p>
        </div>

        <div className="max-w-2xl mx-auto bg-[#222222] border border-[#353535] rounded-2xl p-6 sm:p-8 shadow-2xl">
          {confirmed ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-[#151515] border border-[#22C55E] text-[#22C55E] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-wider">Table Reserved!</h3>
              <p className="text-sm text-[#D1D5DB] max-w-md mx-auto leading-relaxed">
                Thank you, <span className="font-bold text-white">{formData.name}</span>! Your table for <span className="text-[#FFC400] font-bold">{formData.guests}</span> on <span className="text-[#FFC400] font-bold">{formData.date} at {formData.time}</span> has been confirmed at Krispier Kasur.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => setConfirmed(false)}
                  className="cursor-pointer px-6 py-3 bg-[#FFC400] hover:bg-[#FFB800] text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md"
                >
                  Make Another Reservation
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Farooq Siddiqui"
                    className="w-full px-4 py-3 text-xs bg-[#151515] border border-[#353535] rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#FFC400]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +92 300 4882200"
                    className="w-full px-4 py-3 text-xs bg-[#151515] border border-[#353535] rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#FFC400]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">Party Size</label>
                  <div className="relative">
                    <select
                      value={formData.guests}
                      onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                      className="cursor-pointer w-full px-4 py-3 text-xs bg-[#151515] border border-[#353535] rounded-xl text-white focus:outline-none focus:border-[#FFC400] appearance-none"
                    >
                      <option>1 Guest</option>
                      <option>2 Guests</option>
                      <option>3 Guests</option>
                      <option>4 Guests</option>
                      <option>5-6 Guests</option>
                      <option>7-12 Guests (Family Hall)</option>
                    </select>
                    <Users className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#FFC400] pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="cursor-pointer w-full px-4 py-3 text-xs bg-[#151515] border border-[#353535] rounded-xl text-white focus:outline-none focus:border-[#FFC400]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">Time Slot</label>
                  <div className="relative">
                    <select
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="cursor-pointer w-full px-4 py-3 text-xs bg-[#151515] border border-[#353535] rounded-xl text-white focus:outline-none focus:border-[#FFC400] appearance-none"
                    >
                      <option value="13:30">01:30 PM (Lunch)</option>
                      <option value="15:00">03:00 PM (Afternoon)</option>
                      <option value="18:30">06:30 PM (Evening)</option>
                      <option value="19:30">07:30 PM (Dinner)</option>
                      <option value="21:00">09:00 PM (Dinner Rush)</option>
                      <option value="23:00">11:00 PM (Late Night Feast)</option>
                    </select>
                    <Clock className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#FFC400] pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">Special Occasion or Seating Request</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Birthday celebration, prefer booth, extra high chair needed"
                  className="w-full px-4 py-3 text-xs bg-[#151515] border border-[#353535] rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#FFC400]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="cursor-pointer w-full py-4 bg-[#FFC400] hover:bg-[#FFB800] text-black font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg"
                >
                  Confirm Table Booking
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
