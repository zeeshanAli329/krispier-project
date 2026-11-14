import React from 'react';
import { FoodItem } from '../../types';
import { Plus, Flame } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface SignatureDishesProps {
  foods: FoodItem[];
  onSelectItem: (item: FoodItem) => void;
}

export const SignatureDishes: React.FC<SignatureDishesProps> = ({ foods, onSelectItem }) => {
  const { addItem } = useCart();
  const signatureItems = foods.filter((f) => f.isChefSpecial).slice(0, 4);

  return (
    <section id="signature" className="py-20 bg-[#151515] border-b border-[#353535]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="text-xs font-bold tracking-widest uppercase text-[#FFC400] mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FFC400]"></span>
              <span>Krispier Signature Craves</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
              Top Fast-Food Favorites
            </h2>
          </div>
          <p className="text-sm text-[#D1D5DB] max-w-md mt-3 md:mt-0">
            Kasur's most craveable crispy broast, loaded burgers, spicy tenders, and hand-tossed pizzas paired with our secret signature sauces.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {signatureItems.map((dish) => (
            <div
              key={dish._id}
              className="bg-[#222222] rounded-2xl border border-[#353535] hover:border-[#FFC400] transition-all duration-200 flex flex-col overflow-hidden group shadow-lg"
            >
              {/* Product Imagery */}
              <div
                className="relative aspect-[4/3] bg-[#1a1a1a] overflow-hidden cursor-pointer"
                onClick={() => onSelectItem(dish)}
              >
                <img
                  src={dish.image}
                  alt={dish.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-[#151515]/90 border border-[#353535] text-[#FFC400] text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-[#FFC400] text-[#FFC400]" />
                  <span>Crave Special</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#FFC400] uppercase tracking-wider mb-1">
                    {dish.category}
                  </div>
                  <h3
                    onClick={() => onSelectItem(dish)}
                    className="text-base font-bold text-white group-hover:text-[#FFC400] transition-colors cursor-pointer line-clamp-1"
                  >
                    {dish.name}
                  </h3>
                  <p className="text-xs text-[#D1D5DB] mt-2 line-clamp-2 leading-relaxed">
                    {dish.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#353535] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-[#A0A0A0] block font-medium">Price</span>
                    <span className="text-lg font-black text-[#FFC400] tabular-nums">
                      PKR {dish.price.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectItem(dish)}
                      className="cursor-pointer px-3 py-1.5 text-xs font-bold text-white hover:text-black bg-[#2d2d2d] hover:bg-[#FFC400] rounded-xl transition-all whitespace-nowrap border border-[#3d3d3d]"
                    >
                      Details
                    </button>
                    <button
                      type="button"
                      onClick={() => addItem(dish, 1)}
                      className="cursor-pointer p-2.5 bg-[#FFC400] hover:bg-[#FFB800] active:scale-95 text-black font-black rounded-xl transition-all shadow-sm"
                      title="Quick Add to Cart"
                      aria-label={`Add ${dish.name} to cart`}
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
