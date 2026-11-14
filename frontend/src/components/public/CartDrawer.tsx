import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, CheckCircle2, Bike, Store, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Order } from '../../types';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    tax,
    grandTotal,
    taxRate,
  } = useCart();

  const [orderType, setOrderType] = useState<'delivery' | 'takeaway'>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const deliveryFee = orderType === 'delivery' ? 150 : 0;
  const finalTotal = grandTotal + deliveryFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg('Please provide your name and phone number.');
      return;
    }

    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      setErrorMsg('Please provide a complete Kasur delivery address.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const orderPayload = {
        orderType,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: orderType === 'delivery' ? deliveryAddress.trim() : 'Krispier Kasur Counter',
        specialNotes: specialNotes.trim(),
        paymentMethod,
        items: items.map((i) => ({
          foodId: i.food._id,
          name: i.food.name,
          price: i.food.price,
          quantity: i.quantity,
          specialInstructions: i.specialInstructions,
          image: i.food.image,
        })),
      };

      const placedOrder = await api.createOrder(orderPayload);
      setOrderSuccess(placedOrder);
      clearCart();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsCartOpen(false);
    if (orderSuccess) {
      setOrderSuccess(null);
    }
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="cursor-pointer absolute inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#151515] text-[#D1D5DB] shadow-2xl flex flex-col border-l border-[#353535]">
          {/* Header */}
          <div className="px-6 py-4 bg-[#222222] border-b border-[#353535] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#FFC400]" />
              <h2 className="text-lg font-black text-white uppercase tracking-wider">Your Krispier Box</h2>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="cursor-pointer p-1.5 rounded-lg text-[#A0A0A0] hover:text-white hover:bg-[#353535] transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Success State */}
          {orderSuccess ? (
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#222222] border-2 border-[#22C55E] text-[#22C55E] flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-wider">Order Fired Up!</h3>
              <p className="text-xs text-[#D1D5DB]">
                Thank you, <span className="font-bold text-white">{orderSuccess.customerName}</span>. Your Krispier feast has been dispatched to the fryer!
              </p>
              <div className="p-4 bg-[#222222] border border-[#353535] rounded-xl w-full text-left space-y-2">
                <div className="flex justify-between text-xs text-[#A0A0A0]">
                  <span>Order Number</span>
                  <span className="font-bold text-[#FFC400]">{orderSuccess.orderNumber}</span>
                </div>
                <div className="flex justify-between text-xs text-[#A0A0A0]">
                  <span>Order Type</span>
                  <span className="capitalize font-semibold text-white">{orderSuccess.orderType}</span>
                </div>
                <div className="flex justify-between text-xs text-[#A0A0A0]">
                  <span>Total Amount</span>
                  <span className="font-black text-[#FFC400] tabular-nums">
                    PKR {orderSuccess.grandTotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-[#A0A0A0]">
                  <span>Payment Mode</span>
                  <span className="capitalize font-semibold text-white">
                    {orderSuccess.paymentMethod} on Delivery
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="cursor-pointer w-full py-3.5 bg-[#FFC400] hover:bg-[#FFB800] text-black font-black uppercase tracking-wider rounded-xl transition-all shadow-md"
              >
                Continue Craving
              </button>
            </div>
          ) : (
            <>
              {/* Items List or Empty */}
              <div className="flex-1 overflow-y-auto p-6 divide-y divide-[#353535]">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-[#A0A0A0] space-y-3">
                    <ShoppingBag className="w-12 h-12 text-[#444444] stroke-1" />
                    <p className="text-sm font-bold text-white uppercase">Your box is empty</p>
                    <p className="text-xs text-[#888888] max-w-xs">
                      Add Krispier zinger burgers, spicy tenders, broast, or loaded fries to start your order.
                    </p>
                  </div>
                ) : (
                  items.map(({ food, quantity, specialInstructions }) => (
                    <div key={food._id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                      <img
                        src={food.image}
                        alt={food.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl object-cover bg-[#222222] border border-[#353535] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-bold text-white truncate">
                            {food.name}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeItem(food._id)}
                            className="cursor-pointer text-[#A0A0A0] hover:text-[#EF4444] p-1 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-xs text-[#FFC400] font-black tabular-nums mt-0.5">
                          PKR {(food.price * quantity).toLocaleString()}
                        </div>
                        {specialInstructions && (
                          <div className="text-[10px] text-[#FFC400] bg-[#222222] border border-[#353535] rounded-lg px-2 py-0.5 mt-1 truncate">
                            Note: {specialInstructions}
                          </div>
                        )}

                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center border border-[#353535] rounded-lg bg-[#222222]">
                            <button
                              type="button"
                              onClick={() => updateQuantity(food._id, quantity - 1)}
                              className="cursor-pointer p-1 text-[#D1D5DB] hover:text-[#FFC400]"
                              aria-label="Decrease"
                            >
                              <Minus className="w-3 h-3 stroke-[2.5]" />
                            </button>
                            <span className="px-2 text-xs font-black text-white tabular-nums">
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(food._id, quantity + 1)}
                              className="cursor-pointer p-1 text-[#D1D5DB] hover:text-[#FFC400]"
                              aria-label="Increase"
                            >
                              <Plus className="w-3 h-3 stroke-[2.5]" />
                            </button>
                          </div>
                          <span className="text-[11px] text-[#888888] tabular-nums">
                            @ PKR {food.price.toLocaleString()} each
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Order Form & Checkout Section */}
              {items.length > 0 && (
                <div className="border-t border-[#353535] bg-[#1a1a1a] p-6 space-y-4 max-h-[50vh] overflow-y-auto">
                  {/* Delivery vs Takeaway segmented toggle */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-[#222222] border border-[#353535] rounded-xl">
                    <button
                      type="button"
                      onClick={() => setOrderType('delivery')}
                      className={`cursor-pointer flex items-center justify-center gap-1.5 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                        orderType === 'delivery'
                          ? 'bg-[#FFC400] text-black shadow-sm'
                          : 'text-[#D1D5DB] hover:text-white'
                      }`}
                    >
                      <Bike className="w-3.5 h-3.5" />
                      <span>Kasur Delivery (+150)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('takeaway')}
                      className={`cursor-pointer flex items-center justify-center gap-1.5 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                        orderType === 'takeaway'
                          ? 'bg-[#FFC400] text-black shadow-sm'
                          : 'text-[#D1D5DB] hover:text-white'
                      }`}
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>Self Takeaway</span>
                    </button>
                  </div>

                  {/* Customer Information */}
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Your Full Name *"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-[#222222] border border-[#353535] rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#FFC400]"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Contact Phone Number (e.g. 0300-4882200) *"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-[#222222] border border-[#353535] rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#FFC400]"
                      required
                    />

                    {orderType === 'delivery' && (
                      <textarea
                        rows={2}
                        placeholder="Street Address, Area or Landmark in Kasur *"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-[#222222] border border-[#353535] rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#FFC400]"
                        required
                      />
                    )}

                    <input
                      type="text"
                      placeholder="Extra dips / delivery notes (optional)"
                      value={specialNotes}
                      onChange={(e) => setSpecialNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-[#222222] border border-[#353535] rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#FFC400]"
                    />
                  </div>

                  {/* Payment Method Selector */}
                  <div className="flex items-center gap-4 text-xs font-semibold text-[#D1D5DB]">
                    <span>Payment:</span>
                    <label className="cursor-pointer flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="payment"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={() => setPaymentMethod('cash')}
                        className="cursor-pointer accent-[#FFC400]"
                      />
                      <span>Cash on Delivery</span>
                    </label>
                    <label className="cursor-pointer flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="cursor-pointer accent-[#FFC400]"
                      />
                      <span>Card on Delivery</span>
                    </label>
                  </div>

                  {/* Price Breakdown */}
                  <div className="pt-2 border-t border-[#353535] space-y-1 text-xs">
                    <div className="flex justify-between text-[#A0A0A0]">
                      <span>Subtotal</span>
                      <span className="tabular-nums text-white">PKR {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[#A0A0A0]">
                      <span>Sales Tax ({taxRate}% GST)</span>
                      <span className="tabular-nums text-white">PKR {tax.toLocaleString()}</span>
                    </div>
                    {orderType === 'delivery' && (
                      <div className="flex justify-between text-[#A0A0A0]">
                        <span>Kasur Delivery Fee</span>
                        <span className="tabular-nums text-white">PKR {deliveryFee.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-black text-white pt-1 border-t border-[#353535]">
                      <span>Grand Total</span>
                      <span className="tabular-nums text-[#FFC400]">
                        PKR {finalTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="flex items-center gap-1.5 text-xs text-[#EF4444] bg-[#222222] p-2.5 rounded-xl border border-[#EF4444]/40">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="button"
                    onClick={handleSubmitOrder}
                    disabled={isSubmitting}
                    className="cursor-pointer w-full py-3.5 bg-[#FFC400] hover:bg-[#FFB800] disabled:bg-[#353535] disabled:cursor-not-allowed text-black font-black uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>{isSubmitting ? 'Transmitting Order...' : 'Confirm & Place Order'}</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
