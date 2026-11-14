import React, { useState } from 'react';
import { FoodItem, Category } from '../../types';
import { Search, Plus, Leaf, Flame, Clock } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface MenuSectionProps {
  categories: Category[];
  foods: FoodItem[];
  onSelectItem: (item: FoodItem) => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({ categories, foods, onSelectItem }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { addItem } = useCart();

  const filteredFoods = foods.filter((food) => {
    const matchesCategory = selectedCategory === 'All' || food.category === selectedCategory;
    const matchesSearch =
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="menu" className="py-24 bg-[#151515] border-b border-[#353535]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="text-xs font-bold tracking-widest uppercase text-[#FFC400] mb-2 flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FFC400]"></span>
            <span>Kasur's Crispiest Fast Food</span>
            <span className="w-2 h-2 rounded-full bg-[#FFC400]"></span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            Explore Full Krispier Menu
          </h2>
          <p className="text-[#D1D5DB] mt-3 text-base">
            Every order is fried crispy fresh, tossed with our original sauces, and served piping hot.
          </p>
        </div>

        {/* Search Bar & Category Filter Bar */}
        <div className="space-y-6 mb-12">
          {/* Search Input */}
          <div className="max-w-md mx-auto relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search burgers, broast, pizza, sauces, shakes..."
              className="w-full pl-11 pr-14 py-3.5 bg-[#222222] border border-[#353535] rounded-xl text-sm focus:outline-none focus:border-[#FFC400] transition-all text-white placeholder:text-[#888888]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="cursor-pointer absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#FFC400] hover:text-[#FFB800] px-2 py-1"
              >
                Clear
              </button>
            )}
          </div>

          {/* Interactive Category Segmented Tabs (Horizontal scroll on mobile) */}
          <div className="flex items-center justify-start lg:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className={`cursor-pointer px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap shrink-0 ${
                selectedCategory === 'All'
                  ? 'bg-[#FFC400] text-black shadow-md'
                  : 'bg-[#222222] text-[#D1D5DB] hover:bg-[#2d2d2d] hover:text-white border border-[#353535]'
              }`}
            >
              All Items ({foods.length})
            </button>
            {categories.map((cat) => (
              <button
                type="button"
                key={cat._id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`cursor-pointer px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap shrink-0 ${
                  selectedCategory === cat.name
                    ? 'bg-[#FFC400] text-black shadow-md'
                    : 'bg-[#222222] text-[#D1D5DB] hover:bg-[#2d2d2d] hover:text-white border border-[#353535]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Food Items Grid */}
        {filteredFoods.length === 0 ? (
          <div className="text-center py-16 bg-[#222222] rounded-2xl border border-dashed border-[#353535]">
            <p className="text-[#D1D5DB] text-sm">No items found matching "{searchQuery}".</p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="cursor-pointer mt-3 text-xs font-bold text-[#FFC400] hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFoods.map((food) => (
              <div
                key={food._id}
                className="bg-[#222222] rounded-2xl border border-[#353535] hover:border-[#FFC400] transition-all duration-200 flex flex-col overflow-hidden group shadow-lg"
              >
                {/* Image slot */}
                <div
                  className="relative aspect-[16/10] bg-[#1a1a1a] overflow-hidden cursor-pointer"
                  onClick={() => onSelectItem(food)}
                >
                  <img
                    src={food.image}
                    alt={food.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Status indicators */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    {food.isChefSpecial && (
                      <span className="bg-[#151515]/90 border border-[#353535] text-[#FFC400] text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <Flame className="w-3 h-3 fill-[#FFC400] text-[#FFC400]" />
                        Popular
                      </span>
                    )}
                    {food.isVegetarian && (
                      <span className="bg-[#151515]/90 border border-emerald-800 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <Leaf className="w-3 h-3 text-emerald-400" />
                        Veg
                      </span>
                    )}
                  </div>

                  {!food.isAvailable && (
                    <div className="absolute inset-0 bg-[#151515]/80 backdrop-blur-xs flex items-center justify-center">
                      <span className="text-white text-xs font-black uppercase tracking-wider bg-[#EF4444] px-3.5 py-1.5 rounded-lg">
                        Sold Out Today
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#FFC400] font-semibold uppercase tracking-wider mb-1">
                      <span>{food.category}</span>
                      <span className="flex items-center gap-1 text-[#A0A0A0] text-[11px] font-medium normal-case">
                        <Clock className="w-3 h-3 text-[#FFC400]" />
                        {food.preparationTime} mins
                      </span>
                    </div>

                    <h3
                      onClick={() => onSelectItem(food)}
                      className="text-base font-bold text-white group-hover:text-[#FFC400] transition-colors cursor-pointer"
                    >
                      {food.name}
                    </h3>

                    <p className="text-xs text-[#D1D5DB] mt-2 line-clamp-2 leading-relaxed">
                      {food.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#353535] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-[#A0A0A0] font-medium">Price in PKR</div>
                      <div className="text-lg font-black text-[#FFC400] tabular-nums">
                        PKR {food.price.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectItem(food)}
                        className="cursor-pointer px-3.5 py-2 text-xs font-bold text-white hover:text-black bg-[#2d2d2d] hover:bg-[#FFC400] rounded-xl transition-all whitespace-nowrap border border-[#3d3d3d]"
                      >
                        Customize
                      </button>

                      <button
                        type="button"
                        disabled={!food.isAvailable}
                        onClick={() => addItem(food, 1)}
                        className="cursor-pointer p-2.5 bg-[#FFC400] hover:bg-[#FFB800] disabled:bg-[#353535] disabled:cursor-not-allowed text-black font-black rounded-xl transition-all shadow-sm"
                        title="Add to Cart"
                        aria-label={`Add ${food.name} to cart`}
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
