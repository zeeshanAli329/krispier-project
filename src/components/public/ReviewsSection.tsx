import React, { useState } from 'react';
import { Review } from '../../types';
import { Star, MessageSquarePlus, CheckCircle2, X } from 'lucide-react';
import { api } from '../../services/api';

interface ReviewsSectionProps {
  reviews: Review[];
  onReviewAdded: (rev: Review) => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews, onReviewAdded }) => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [dishName, setDishName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    setSubmitting(true);
    try {
      const newRev = await api.createReview({
        customerName: name.trim(),
        rating,
        comment: comment.trim(),
        dishName: dishName.trim(),
      });
      onReviewAdded(newRev);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setShowModal(false);
        setName('');
        setComment('');
        setDishName('');
      }, 1200);
    } catch {
      // error handling
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="py-24 bg-[#151515] border-b border-[#353535]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="text-xs font-bold tracking-widest uppercase text-[#FFC400] mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FFC400]"></span>
              <span>Kasur Community Love</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
              Customer Reviews
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="cursor-pointer mt-4 md:mt-0 inline-flex items-center gap-2 px-5 py-3 bg-[#FFC400] hover:bg-[#FFB800] text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md self-start"
          >
            <MessageSquarePlus className="w-4 h-4 stroke-[2.5]" />
            <span>Leave a Review</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev) => (
            <div
              key={rev._id}
              className="p-6 bg-[#222222] border border-[#353535] hover:border-[#FFC400] rounded-2xl flex flex-col justify-between shadow-lg transition-all"
            >
              <div>
                <div className="flex items-center gap-1 text-[#FFC400] mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < rev.rating ? 'fill-[#FFC400] text-[#FFC400]' : 'text-[#353535]'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-[#D1D5DB] leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#353535] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">{rev.customerName}</h4>
                  {rev.dishName && (
                    <span className="text-[11px] text-[#FFC400] block mt-0.5">
                      Craved: {rev.dishName}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold text-[#A0A0A0] uppercase tracking-wider">
                  Verified Diner
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#222222] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#353535]">
            {success ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-[#22C55E] mx-auto" />
                <h4 className="text-lg font-bold text-white">Review Submitted!</h4>
                <p className="text-xs text-[#D1D5DB]">Thank you for supporting Krispier Kasur.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#353535]">
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">Write a Review</h3>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="cursor-pointer text-[#A0A0A0] hover:text-white p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">Your Rating</label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="cursor-pointer p-1 text-[#FFC400] hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= rating ? 'fill-[#FFC400] text-[#FFC400]' : 'text-[#353535]'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#D1D5DB] mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Hamza Farooq"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#151515] border border-[#353535] rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#FFC400]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#D1D5DB] mb-1">Favorite Dish Ordered (Optional)</label>
                  <input
                    type="text"
                    value={dishName}
                    onChange={(e) => setDishName(e.target.value)}
                    placeholder="e.g. Krispier Thunder Zinger Burger"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#151515] border border-[#353535] rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#FFC400]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#D1D5DB] mb-1">Your Review *</label>
                  <textarea
                    rows={3}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us about the crunch, sauces, and atmosphere..."
                    className="w-full px-3.5 py-2.5 text-xs bg-[#151515] border border-[#353535] rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#FFC400]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="cursor-pointer w-full py-3 bg-[#FFC400] hover:bg-[#FFB800] text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
                >
                  {submitting ? 'Submitting Review...' : 'Post Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
