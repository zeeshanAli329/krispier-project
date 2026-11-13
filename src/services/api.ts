import { FoodItem, Category, TableItem, Order, Review, RestaurantSettings, User, NotificationItem } from '../types';

const TOKEN_KEY = 'smartdine_auth_token';
const USER_KEY = 'smartdine_auth_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredAuth(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser(): User | null {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    throw new Error(
      `API ${endpoint} returned ${contentType || 'a non-JSON response'} (HTTP ${res.status}). ` +
      'Check the Vercel API rewrite and API_BASE_URL backend configuration.'
    );
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new Error(`API ${endpoint} returned invalid JSON (HTTP ${res.status}).`);
  }

  if (!res.ok) {
    const message = data && typeof data === 'object' && 'message' in data
      ? String(data.message)
      : `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}

async function requestArray<T>(endpoint: string, options?: RequestInit): Promise<T[]> {
  const data: unknown = await request<unknown>(endpoint, options);
  if (!Array.isArray(data)) {
    throw new TypeError(`API ${endpoint} expected an array response, received ${describeResponse(data)}.`);
  }
  return data as T[];
}

function describeResponse(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'an array';
  if (typeof value === 'object') return 'an object';
  return `a ${typeof value}`;
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  getMe: () => request<{ user: User }>('/api/auth/me'),

  // Categories
  getCategories: () => requestArray<Category>('/api/categories'),
  createCategory: (data: Partial<Category>) =>
    request<Category>('/api/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: string, data: Partial<Category>) =>
    request<Category>(`/api/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id: string) => request<{ message: string }>(`/api/categories/${id}`, { method: 'DELETE' }),

  // Foods
  getFoods: (params?: { category?: string; search?: string; availableOnly?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.availableOnly) query.set('availableOnly', 'true');
    return requestArray<FoodItem>(`/api/foods?${query.toString()}`);
  },
  createFood: (data: Partial<FoodItem>) =>
    request<FoodItem>('/api/foods', { method: 'POST', body: JSON.stringify(data) }),
  updateFood: (id: string, data: Partial<FoodItem>) =>
    request<FoodItem>(`/api/foods/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleFoodAvailability: (id: string) =>
    request<FoodItem>(`/api/foods/${id}/toggle`, { method: 'PATCH' }),
  deleteFood: (id: string) => request<{ message: string }>(`/api/foods/${id}`, { method: 'DELETE' }),

  // Tables
  getTables: () => requestArray<TableItem>('/api/tables'),
  getTableByNumber: (tableNumber: string) => request<TableItem>(`/api/tables/${tableNumber}`),
  createTable: (data: Partial<TableItem>) =>
    request<TableItem>('/api/tables', { method: 'POST', body: JSON.stringify(data) }),
  updateTable: (id: string, data: Partial<TableItem>) =>
    request<TableItem>(`/api/tables/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTable: (id: string) => request<{ message: string }>(`/api/tables/${id}`, { method: 'DELETE' }),

  // Orders
  getOrders: (params?: { status?: string; type?: string; tableNumber?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.type) query.set('type', params.type);
    if (params?.tableNumber) query.set('tableNumber', params.tableNumber);
    return requestArray<Order>(`/api/orders?${query.toString()}`);
  },
  getOrderById: (id: string) => request<Order>(`/api/orders/${id}`),
  createOrder: (orderData: any) =>
    request<Order>('/api/orders', { method: 'POST', body: JSON.stringify(orderData) }),
  updateOrderStatus: (id: string, status: string, extra?: { cookId?: string; deliveryBoyId?: string }) =>
    request<Order>(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, ...extra }),
    }),
  callWaiter: (tableNumber: string, reason?: string) =>
    request<{ message: string }>('/api/orders/call-waiter', {
      method: 'POST',
      body: JSON.stringify({ tableNumber, reason }),
    }),
  requestBill: (tableNumber: string, paymentMethod: string) =>
    request<{ message: string }>('/api/orders/request-bill', {
      method: 'POST',
      body: JSON.stringify({ tableNumber, paymentMethod }),
    }),

  // Staff
  getStaff: () => requestArray<User>('/api/staff'),
  createStaff: (data: any) => request<User>('/api/staff', { method: 'POST', body: JSON.stringify(data) }),
  updateStaff: (id: string, data: any) =>
    request<User>(`/api/staff/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleStaffStatus: (id: string) => request<User>(`/api/staff/${id}/toggle`, { method: 'PATCH' }),
  deleteStaff: (id: string) => request<{ message: string }>(`/api/staff/${id}`, { method: 'DELETE' }),

  // Billing
  confirmPayment: (orderId: string, paymentMethod: string) =>
    request<Order>('/api/billing/confirm', {
      method: 'POST',
      body: JSON.stringify({ orderId, paymentMethod }),
    }),
  getBillingHistory: () => requestArray<Order>('/api/billing/history'),

  // Reports
  getDashboardStats: () =>
    request<{
      totalOrders: number;
      newOrders: number;
      preparingOrders: number;
      readyOrders: number;
      servedOrders: number;
      totalRevenue: number;
      activeTables: number;
      availableTables: number;
      topDishes: Array<{ name: string; count: number; revenue: number }>;
    }>('/api/reports/dashboard'),

  // Reviews
  getReviews: () => requestArray<Review>('/api/reviews'),
  createReview: (data: { customerName: string; rating: number; comment: string; dishName?: string }) =>
    request<Review>('/api/reviews', { method: 'POST', body: JSON.stringify(data) }),

  // Settings
  getSettings: () => request<RestaurantSettings>('/api/settings'),
  updateSettings: (data: Partial<RestaurantSettings>) =>
    request<RestaurantSettings>('/api/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Notifications
  getNotifications: () => requestArray<NotificationItem>('/api/notifications'),
  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/api/notifications/${id}/read`, { method: 'PATCH' }),
};
