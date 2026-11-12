import React, { useState, useEffect } from 'react';
import { FoodItem, Category, TableItem, Order } from '../../types';
import { api } from '../../services/api';
import { subscribeToEvent } from '../../services/socket';
import { KrispierLogo } from '../common/KrispierLogo';
import {
  Search,
  Plus,
  Minus,
  ShoppingBag,
  BellRing,
  ReceiptText,
  Clock,
  Flame,
  Leaf,
  X,
} from 'lucide-react';

interface TableMenuProps {
  tableNumber: string;
}

export const TableMenu: React.FC<TableMenuProps> = ({ tableNumber }) => {
  const [table, setTable] = useState<TableItem | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Cart for this table
  const [cartItems, setCartItems] = useState<
    Array<{ food: FoodItem; quantity: number; specialInstructions: string }>
  >([]);

  // Active / Submitted Order state
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFoodForModal, setSelectedFoodForModal] = useState<FoodItem | null>(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [modalNotes, setModalNotes] = useState('');

  // Notifications / feedback
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'info'; text: string } | null>(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [billPaymentMethod, setBillPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [, setBillRequested] = useState(false);
  const [waiterCalled, setWaiterCalled] = useState(false);

  // Fetch table data, categories, and foods
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [cats, foodList, tblList] = await Promise.all([
          api.getCategories(),
          api.getFoods({ availableOnly: true }),
          api.getTables(),
        ]);
        setCategories(cats);
        setFoods(foodList);

        const foundTable = tblList.find(
          (t) => t.tableNumber.toUpperCase() === tableNumber.toUpperCase()
        );
        if (foundTable) {
          setTable(foundTable);
          if (foundTable.currentOrderId) {
            api.getOrderById(foundTable.currentOrderId)
              .then((ord) => setActiveOrder(ord))
              .catch(() => {});
          }
        }
      } catch (err) {
        console.error('Error loading table menu:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Subscribe to Socket.IO real-time order status updates for this table
    const unsubOrder = subscribeToEvent<Order>('order:updated', (updated) => {
      if (updated.tableNumber?.toUpperCase() === tableNumber.toUpperCase()) {
        setActiveOrder(updated);
        if (updated.status === 'served') {
          setFeedbackMsg({ type: 'success', text: `Food has been served to Table ${tableNumber}! Enjoy your Krispier feast!` });
        } else if (updated.status === 'ready') {
          setFeedbackMsg({ type: 'info', text: `Your order is READY and waiter is bringing it to Table ${tableNumber}!` });
        }
      }
    });

    return () => {
      unsubOrder();
    };
  }, [tableNumber]);

  // Cart helper functions
  const addToCart = (food: FoodItem, qty = 1, notes = '') => {
    setCartItems((prev) => {
      const idx = prev.findIndex((i) => i.food._id === food._id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx].quantity += qty;
        if (notes) copy[idx].specialInstructions = notes;
        return copy;
      }
      return [...prev, { food, quantity: qty, specialInstructions: notes }];
    });
  };

  const updateCartQty = (foodId: string, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.food._id === foodId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as any;
    });
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.food.price * item.quantity, 0);
  const tax = Math.round((subtotal * 16) / 100);
  const grandTotal = subtotal + tax;

  // Place Table Order
  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    setIsSubmitting(true);
    try {
      const orderPayload = {
        orderType: 'dine_in',
        tableNumber: tableNumber.toUpperCase(),
        customerName: `Guest at Table ${tableNumber.toUpperCase()}`,
        paymentMethod: 'cash',
        items: cartItems.map((i) => ({
          foodId: i.food._id,
          name: i.food.name,
          price: i.food.price,
          quantity: i.quantity,
          specialInstructions: i.specialInstructions,
          image: i.food.image,
        })),
      };

      const created = await api.createOrder(orderPayload);
      setActiveOrder(created);
      setCartItems([]);
      setFeedbackMsg({
        type: 'success',
        text: `Order ${created.orderNumber} transmitted directly to Krispier kitchen!`,
      });
    } catch (err: any) {
      alert(err.message || 'Failed to submit order');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Call Waiter
  const handleCallWaiter = async () => {
    try {
      await api.callWaiter(tableNumber.toUpperCase(), `Guest assistance requested at Table ${tableNumber}`);
      setWaiterCalled(true);
      setFeedbackMsg({ type: 'info', text: `Assigned server notified. Headed to Table ${tableNumber}.` });
      setTimeout(() => setWaiterCalled(false), 5000);
    } catch {
      alert('Could not notify server. Please try again.');
    }
  };

  // Request Bill
  const handleRequestBill = async () => {
    try {
      await api.requestBill(tableNumber.toUpperCase(), billPaymentMethod);
      setShowBillModal(false);
      setBillRequested(true);
      setFeedbackMsg({
        type: 'success',
        text: `Bill requested via ${billPaymentMethod.toUpperCase()}. Waiter will bring the printed receipt to Table ${tableNumber}.`,
      });
    } catch {
      alert('Could not submit bill request.');
    }
  };

  // Filter foods
  const filteredFoods = foods.filter((food) => {
    const matchesCat = selectedCategory === 'All' || food.category === selectedCategory;
    const matchesSearch =
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getStatusStepIndex = (status: string) => {
    switch (status) {
      case 'new':
        return 0;
      case 'accepted':
        return 1;
      case 'preparing':
        return 2;
      case 'ready':
        return 3;
      case 'served':
        return 4;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#151515] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#FFC400] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-white uppercase tracking-wider">
            Loading Krispier Table {tableNumber} Menu...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#151515] text-[#D1D5DB] pb-32">
      {/* Top Table Bar */}
      <header className="sticky top-0 z-30 bg-[#222222] text-white shadow-xl border-b border-[#353535]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <KrispierLogo size="sm" />
            <div className="border-l border-[#353535] pl-3">
              <div className="text-[10px] text-[#FFC400] font-black uppercase tracking-widest">
                Digital QR Dining
              </div>
              <h1 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>Table {tableNumber.toUpperCase()}</span>
                <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                <span className="text-xs font-normal text-[#A0A0A0]">
                  {table?.name || 'Kasur Dining Room'}
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCallWaiter}
              disabled={waiterCalled}
              className={`cursor-pointer flex items-center gap-1.5 px-3 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm ${
                waiterCalled
                  ? 'bg-[#FFC400] text-black'
                  : 'bg-[#151515] hover:bg-[#FFC400] text-[#FFC400] hover:text-black border border-[#353535]'
              }`}
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>{waiterCalled ? 'Calling...' : 'Call Waiter'}</span>
            </button>

            {activeOrder && (
              <button
                type="button"
                onClick={() => setShowBillModal(true)}
                className="cursor-pointer flex items-center gap-1.5 px-3 py-2 text-xs font-black uppercase tracking-wider bg-[#22C55E] hover:bg-emerald-600 text-white rounded-xl transition-all shadow-sm"
              >
                <ReceiptText className="w-3.5 h-3.5" />
                <span>Bill</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Floating feedback alert */}
      {feedbackMsg && (
        <div className="max-w-4xl mx-auto px-4 pt-3">
          <div className="p-3.5 bg-[#222222] border border-[#FFC400] text-white text-xs font-semibold rounded-xl flex items-center justify-between shadow-xl">
            <span>{feedbackMsg.text}</span>
            <button
              type="button"
              onClick={() => setFeedbackMsg(null)}
              className="cursor-pointer text-xs text-[#FFC400] hover:text-white font-bold ml-2"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Live Order Tracker (if an order has been placed) */}
      {activeOrder && (
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <div className="bg-[#222222] rounded-2xl p-5 border border-[#353535] shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-[#353535] pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFC400]">
                  Live Kitchen Tracker
                </span>
                <h3 className="text-sm font-bold text-white">{activeOrder.orderNumber}</h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#A0A0A0]">Total</span>
                <div className="text-sm font-black text-[#FFC400] tabular-nums">
                  PKR {activeOrder.grandTotal.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Stepper Status */}
            <div className="grid grid-cols-5 gap-1 text-center">
              {[
                { label: 'Placed', key: 'new' },
                { label: 'Accepted', key: 'accepted' },
                { label: 'Frying', key: 'preparing' },
                { label: 'Ready', key: 'ready' },
                { label: 'Served', key: 'served' },
              ].map((step, idx) => {
                const currentIdx = getStatusStepIndex(activeOrder.status);
                const isPassed = idx <= currentIdx;
                const isCurrent = idx === currentIdx;
                return (
                  <div key={step.key} className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black mb-1.5 transition-colors ${
                        isCurrent
                          ? 'bg-[#FFC400] text-black ring-4 ring-[#FFC400]/30'
                          : isPassed
                          ? 'bg-[#22C55E] text-white'
                          : 'bg-[#151515] text-[#666666] border border-[#353535]'
                      }`}
                    >
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    <span
                      className={`text-[10px] uppercase font-bold leading-tight ${
                        isCurrent
                          ? 'text-[#FFC400]'
                          : isPassed
                          ? 'text-white'
                          : 'text-[#666666]'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="text-xs text-[#D1D5DB] bg-[#151515] rounded-xl p-3 flex items-center justify-between border border-[#353535]">
              <span>Status: <strong className="capitalize text-[#FFC400]">{activeOrder.status}</strong></span>
              {activeOrder.waiterName && (
                <span>Assigned Server: <strong className="text-white">{activeOrder.waiterName}</strong></span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content: Categories, Search, Dishes */}
      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Krispier menu..."
            className="w-full pl-10 pr-4 py-3 bg-[#222222] border border-[#353535] rounded-xl text-xs text-white placeholder:text-[#666666] focus:outline-none focus:border-[#FFC400] shadow-sm"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={`cursor-pointer px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all whitespace-nowrap shrink-0 ${
              selectedCategory === 'All'
                ? 'bg-[#FFC400] text-black shadow-sm'
                : 'bg-[#222222] text-[#D1D5DB] hover:bg-[#2d2d2d] hover:text-white border border-[#353535]'
            }`}
          >
            All Items
          </button>
          {categories.map((c) => (
            <button
              type="button"
              key={c._id}
              onClick={() => setSelectedCategory(c.name)}
              className={`cursor-pointer px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all whitespace-nowrap shrink-0 ${
                selectedCategory === c.name
                  ? 'bg-[#FFC400] text-black shadow-sm'
                  : 'bg-[#222222] text-[#D1D5DB] hover:bg-[#2d2d2d] hover:text-white border border-[#353535]'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Dishes List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredFoods.map((food) => {
            const inCart = cartItems.find((i) => i.food._id === food._id);
            return (
              <div
                key={food._id}
                className="bg-[#222222] rounded-2xl border border-[#353535] hover:border-[#FFC400] shadow-md p-4 flex gap-4 transition-all"
              >
                <img
                  src={food.image}
                  alt={food.name}
                  referrerPolicy="no-referrer"
                  className="cursor-pointer w-24 h-24 rounded-xl object-cover bg-[#151515] border border-[#353535] shrink-0"
                  onClick={() => {
                    setSelectedFoodForModal(food);
                    setModalQuantity(1);
                    setModalNotes('');
                  }}
                />
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      {food.isChefSpecial && (
                        <span className="text-[10px] font-black uppercase text-[#FFC400] bg-[#151515] border border-[#353535] px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                          <Flame className="w-2.5 h-2.5 fill-[#FFC400] text-[#FFC400]" />
                          Special
                        </span>
                      )}
                      {food.isVegetarian && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-[#151515] border border-emerald-800 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                          <Leaf className="w-2.5 h-2.5 text-emerald-400" />
                          Veg
                        </span>
                      )}
                    </div>

                    <h4
                      onClick={() => {
                        setSelectedFoodForModal(food);
                        setModalQuantity(1);
                        setModalNotes('');
                      }}
                      className="cursor-pointer text-sm font-bold text-white truncate hover:text-[#FFC400]"
                    >
                      {food.name}
                    </h4>
                    <p className="text-[11px] text-[#A0A0A0] line-clamp-2 mt-0.5 leading-snug">
                      {food.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-black text-[#FFC400] tabular-nums">
                      PKR {food.price.toLocaleString()}
                    </span>

                    {inCart ? (
                      <div className="flex items-center gap-1.5 bg-[#151515] border border-[#353535] rounded-xl p-1">
                        <button
                          type="button"
                          onClick={() => updateCartQty(food._id, -1)}
                          className="cursor-pointer w-6 h-6 rounded-lg bg-[#222222] text-[#D1D5DB] hover:text-[#FFC400] flex items-center justify-center font-bold text-xs"
                        >
                          <Minus className="w-3 h-3 stroke-[2.5]" />
                        </button>
                        <span className="w-5 text-center text-xs font-black text-white tabular-nums">
                          {inCart.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQty(food._id, 1)}
                          className="cursor-pointer w-6 h-6 rounded-lg bg-[#222222] text-[#D1D5DB] hover:text-[#FFC400] flex items-center justify-center font-bold text-xs"
                        >
                          <Plus className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFoodForModal(food);
                          setModalQuantity(1);
                          setModalNotes('');
                        }}
                        className="cursor-pointer px-3 py-1.5 bg-[#FFC400] hover:bg-[#FFB800] text-black text-xs font-black uppercase tracking-wider rounded-xl shadow-sm flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Bottom Bar: Cart Summary & Place Order */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#222222] border-t border-[#353535] shadow-2xl p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div>
              <div className="text-xs text-[#A0A0A0]">
                <span>{cartItems.reduce((s, i) => s + i.quantity, 0)} items for Table {tableNumber}</span>
                <span className="text-[#888888]"> (incl. 16% GST)</span>
              </div>
              <div className="text-lg font-black text-[#FFC400] tabular-nums">
                PKR {grandTotal.toLocaleString()}
              </div>
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="cursor-pointer py-3.5 px-6 bg-[#FFC400] hover:bg-[#FFB800] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'Transmitting...' : 'Send Order to Kitchen'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Food Customization Modal */}
      {selectedFoodForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#222222] rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-[#353535]">
            <div className="flex gap-3">
              <img
                src={selectedFoodForModal.image}
                alt={selectedFoodForModal.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-xl object-cover bg-[#151515] border border-[#353535]"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white">{selectedFoodForModal.name}</h4>
                <div className="text-xs text-[#FFC400] font-black tabular-nums">
                  PKR {selectedFoodForModal.price.toLocaleString()}
                </div>
                <div className="text-[10px] text-[#A0A0A0] mt-0.5">
                  Approx {selectedFoodForModal.preparationTime} mins prep
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#D1D5DB] mb-1">
                Special Sauce or Cooking Notes for Kitchen
              </label>
              <input
                type="text"
                value={modalNotes}
                onChange={(e) => setModalNotes(e.target.value)}
                placeholder="e.g. Extra spicy sauce, well toasted bun, no mayo"
                className="w-full px-3.5 py-2.5 text-xs bg-[#151515] border border-[#353535] rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#FFC400]"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#353535]">
              <div className="flex items-center border border-[#353535] rounded-xl bg-[#151515] p-1">
                <button
                  type="button"
                  onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                  className="cursor-pointer w-7 h-7 flex items-center justify-center text-[#D1D5DB] hover:text-[#FFC400]"
                >
                  <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
                <span className="w-8 text-center text-xs font-black text-white">
                  {modalQuantity}
                </span>
                <button
                  type="button"
                  onClick={() => setModalQuantity(modalQuantity + 1)}
                  className="cursor-pointer w-7 h-7 flex items-center justify-center text-[#D1D5DB] hover:text-[#FFC400]"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedFoodForModal(null)}
                  className="cursor-pointer px-3 py-2 text-xs font-bold text-[#A0A0A0] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    addToCart(selectedFoodForModal, modalQuantity, modalNotes);
                    setSelectedFoodForModal(null);
                  }}
                  className="cursor-pointer px-4 py-2.5 bg-[#FFC400] hover:bg-[#FFB800] text-black text-xs font-black uppercase tracking-wider rounded-xl shadow-sm"
                >
                  Add · PKR {(selectedFoodForModal.price * modalQuantity).toLocaleString()}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bill Request Modal */}
      {showBillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#222222] rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-[#353535]">
            <div className="flex items-center justify-between border-b border-[#353535] pb-3">
              <div className="flex items-center gap-2 text-white">
                <ReceiptText className="w-5 h-5 text-[#FFC400]" />
                <h3 className="text-base font-black uppercase tracking-wider">Bill for Table {tableNumber}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBillModal(false)}
                className="cursor-pointer text-[#A0A0A0] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-[#D1D5DB]">
              Your server will bring the physical printed bill to your table immediately.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#D1D5DB]">Payment Preference</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBillPaymentMethod('cash')}
                  className={`cursor-pointer py-2.5 text-xs font-bold rounded-xl border text-center transition-all ${
                    billPaymentMethod === 'cash'
                      ? 'bg-[#FFC400] border-[#FFC400] text-black'
                      : 'border-[#353535] bg-[#151515] text-[#D1D5DB] hover:text-white'
                  }`}
                >
                  💵 Cash
                </button>
                <button
                  type="button"
                  onClick={() => setBillPaymentMethod('card')}
                  className={`cursor-pointer py-2.5 text-xs font-bold rounded-xl border text-center transition-all ${
                    billPaymentMethod === 'card'
                      ? 'bg-[#FFC400] border-[#FFC400] text-black'
                      : 'border-[#353535] bg-[#151515] text-[#D1D5DB] hover:text-white'
                  }`}
                >
                  💳 Card POS
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBillModal(false)}
                className="cursor-pointer flex-1 py-2.5 text-xs font-bold text-[#A0A0A0] hover:text-white rounded-xl"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleRequestBill}
                className="cursor-pointer flex-1 py-2.5 bg-[#22C55E] hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-sm"
              >
                Call for Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
