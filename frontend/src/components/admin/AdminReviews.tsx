import React, { useState, useEffect } from 'react';
import { Review } from '../../types';
import { api } from '../../services/api';
import { Star } from 'lucide-react';

export const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    api.getReviews().then((data) => setReviews(data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-[#222222] p-5 rounded-2xl border border-[#353535] shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-wider">Customer Reviews & Ratings</h2>
          <p className="text-xs text-[#A0A0A0]">Monitor guest sentiment across Kasur branch</p>
        </div>
        <div className="text-xs font-bold text-[#D1D5DB]">
          Total Reviews: <span className="font-black text-[#FFC400] text-sm">{reviews.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviews.map((rev) => (
          <div
            key={rev._id}
            className="bg-[#222222] p-5 rounded-2xl border border-[#353535] hover:border-[#FFC400] shadow-lg flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 text-[#FFC400]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < rev.rating ? 'fill-[#FFC400] text-[#FFC400]' : 'text-[#353535]'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-[#22C55E] bg-[#151515] border border-[#22C55E] px-2 py-0.5 rounded-md font-bold uppercase">
                  Verified
                </span>
              </div>

              <p className="text-xs text-[#D1D5DB] italic leading-relaxed">"{rev.comment}"</p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#353535] flex justify-between items-end text-xs">
              <div>
                <span className="font-bold text-white block">{rev.customerName}</span>
                {rev.dishName && (
                  <span className="text-[11px] text-[#FFC400] font-bold">{rev.dishName}</span>
                )}
              </div>
              <span className="text-[10px] text-[#888888]">
                {new Date(rev.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
