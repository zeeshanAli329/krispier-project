import React, { createContext, useContext, useState, useEffect } from 'react';
import { FoodItem, CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  addItem: (food: FoodItem, quantity?: number, specialInstructions?: string) => void;
  updateQuantity: (foodId: string, quantity: number) => void;
  removeItem: (foodId: string) => void;
  clearCart: () => void;
  subtotal: number;
  tax: number;
  grandTotal: number;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  taxRate: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('smartdine_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const taxRate = 16; // 16% GST

  useEffect(() => {
    try {
      localStorage.setItem('smartdine_cart', JSON.stringify(items));
    } catch {
      // storage error
    }
  }, [items]);

  const addItem = (food: FoodItem, quantity = 1, specialInstructions = '') => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.food._id === food._id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        if (specialInstructions) {
          updated[existingIndex].specialInstructions = specialInstructions;
        }
        return updated;
      }
      return [...prev, { food, quantity, specialInstructions }];
    });
  };

  const updateQuantity = (foodId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(foodId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.food._id === foodId ? { ...item, quantity } : item))
    );
  };

  const removeItem = (foodId: string) => {
    setItems((prev) => prev.filter((item) => item.food._id !== foodId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce((acc, item) => acc + item.food.price * item.quantity, 0);
  const tax = Math.round((subtotal * taxRate) / 100);
  const grandTotal = subtotal + tax;
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        subtotal,
        tax,
        grandTotal,
        itemCount,
        isCartOpen,
        setIsCartOpen,
        taxRate,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
