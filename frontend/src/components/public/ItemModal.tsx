import React, { useState } from 'react';
import { FoodItem } from '../../types';
import { X, Minus, Plus, ShoppingBag, Clock, Leaf, Flame } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface ItemModalProps {
  food: FoodItem | null;
  onClose: () => void;
}

export const ItemModal: React.FC<ItemModalProps> = ({ food, onClose }) => {
  if (!food) return null;

  const { addItem, setIsCartOpen } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [addedSuccess, setAddedSuccess] = useState(false);

  const handleAddToCart = () => {
    addItem(food, quantity, specialInstructions);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
      setIsCartOpen(true);
    }, 600);
  };

  const totalPrice = food.price * quantity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#222222] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#353535] relative flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-[#151515]/90 hover:bg-[#FFC400] text-white hover:text-black flex items-center justify-center shadow-md transition-colors border border-[#353535]"
          aria-label="Close"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Food Image */}
        <div className="relative aspect-[16/9] w-full bg-[#151515] shrink-0">
          <img
            src={food.image}
            alt={food.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 left-3 flex gap-2">
            <span className="bg-[#151515]/90 border border-[#353535] text-[#FFC400] text-xs px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider">
              {food.category}
            </span>
            {food.isChefSpecial && (
              <span className="bg-[#FFC400] text-black text-xs px-2.5 py-1 rounded-lg font-black flex items-center gap-1 uppercase">
                <Flame className="w-3.5 h-3.5 fill-black text-black" />
                Krispier Crave
              </span>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-white">{food.name}</h2>
              <div className="text-xl font-black text-[#FFC400] tabular-nums">
                PKR {food.price.toLocaleString()}
              </div>
            </div>
            <p className="text-xs text-[#D1D5DB] mt-2 leading-relaxed">{food.description}</p>
          </div>

          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#A0A0A0] pt-2 border-t border-[#353535]">
            <span className="flex items-center gap-1 text-[#D1D5DB]">
              <Clock className="w-3.5 h-3.5 text-[#FFC400]" />
              Prep: {food.preparationTime} mins
            </span>
            {food.isVegetarian && (
              <span className="flex items-center gap-1 text-[#22C55E] font-bold">
                <Leaf className="w-3.5 h-3.5" />
                Vegetarian
              </span>
            )}
            {food.spicyLevel > 0 && (
              <span className="flex items-center gap-1 text-[#EF4444] font-bold">
                <Flame className="w-3.5 h-3.5" />
                Spice: {'🌶️'.repeat(food.spicyLevel)}
              </span>
            )}
          </div>

          {/* Special Instructions Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#D1D5DB] block">
              Special Sauce or Kitchen Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Extra spicy sauce on the side, well done crinkle fries, no mayo..."
              className="w-full p-3 text-xs bg-[#151515] border border-[#353535] rounded-xl focus:outline-none focus:border-[#FFC400] text-white placeholder:text-[#666666]"
            />
          </div>

          {/* Quantity Selector & Add Button */}
          <div className="pt-4 border-t border-[#353535] flex items-center justify-between gap-4">
            <div className="flex items-center border border-[#353535] rounded-xl p-1 bg-[#151515]">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="cursor-pointer w-8 h-8 rounded-lg flex items-center justify-center text-white hover:text-black hover:bg-[#FFC400] transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              <span className="w-10 text-center font-black text-sm text-white tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="cursor-pointer w-8 h-8 rounded-lg flex items-center justify-center text-white hover:text-black hover:bg-[#FFC400] transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!food.isAvailable}
              className={`cursor-pointer flex-1 py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                addedSuccess
                  ? 'bg-[#22C55E] text-white'
                  : 'bg-[#FFC400] hover:bg-[#FFB800] text-black shadow-md'
              }`}
            >
              <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
              <span>
                {addedSuccess
                  ? 'Added to Box!'
                  : `Add to Box · PKR ${totalPrice.toLocaleString()}`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
