export type Role = 'admin' | 'waiter' | 'cook' | 'delivery';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  active?: boolean;
  assignedTables?: string[];
  createdAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  order: number;
  active: boolean;
}

export interface FoodItem {
  _id: string;
  name: string;
  description: string;
  price: number; // in PKR
  category: string;
  image: string;
  isAvailable: boolean;
  preparationTime: number; // minutes
  spicyLevel: number; // 0-3
  isVegetarian: boolean;
  isChefSpecial: boolean;
  tags: string[];
}

export interface TableItem {
  _id: string;
  tableNumber: string;
  name: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  currentOrderId?: string | null;
  qrCodeUrl: string;
  location: string;
}

export interface OrderItem {
  foodId: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
  image?: string;
}

export type OrderStatus = 'new' | 'accepted' | 'preparing' | 'ready' | 'served' | 'delivered' | 'cancelled';
export type OrderType = 'dine_in' | 'takeaway' | 'delivery';
export type PaymentStatus = 'pending' | 'paid';
export type PaymentMethod = 'cash' | 'card' | 'online';

export interface Order {
  _id: string;
  orderNumber: string;
  orderType: OrderType;
  tableNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  grandTotal: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paidAt?: string | null;
  confirmedBy?: string;
  customerName: string;
  customerPhone?: string;
  deliveryAddress?: string;
  specialNotes?: string;
  waiterId?: string | null;
  waiterName?: string | null;
  cookId?: string | null;
  deliveryBoyId?: string | null;
  deliveryBoyName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: 'order_new' | 'order_status' | 'waiter_call' | 'bill_request' | 'system';
  roleTarget: string;
  tableNumber?: string;
  orderId?: string;
  read: boolean;
  createdAt: string;
}

export interface Review {
  _id: string;
  customerName: string;
  rating: number;
  comment: string;
  dishName?: string;
  approved: boolean;
  createdAt: string;
}

export interface RestaurantSettings {
  restaurantName: string;
  tagline: string;
  currency: string;
  taxRate: number;
  deliveryFee: number;
  phone: string;
  email: string;
  address: string;
  openingHours: string;
  isOpen: boolean;
}

export interface CartItem {
  food: FoodItem;
  quantity: number;
  specialInstructions: string;
}
