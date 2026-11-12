import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { NotificationItem } from '../../types';
import { api } from '../../services/api';
import { subscribeToEvent } from '../../services/socket';
import { KrispierLogo } from '../common/KrispierLogo';
import {
  LayoutDashboard,
  UtensilsCrossed,
  FolderTree,
  QrCode,
  Users,
  ChefHat,
  Bike,
  Receipt,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  ShoppingBag,
  Bell,
  Menu,
  X,
  CheckCircle,
} from 'lucide-react';

interface AdminLayoutProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentTab, onTabChange, children }) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Fetch initial notifications
    api.getNotifications()
      .then((notifs) => setNotifications(notifs))
      .catch(() => {});

    // Listen to real-time notifications
    const unsub = subscribeToEvent<NotificationItem>('notification:new', (notif) => {
      setNotifications((prev) => [notif, ...prev]);
    });

    return () => {
      unsub();
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    await api.markNotificationRead(id).catch(() => {});
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'food_menu', label: 'Food Menu', icon: UtensilsCrossed },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'tables_qr', label: 'Tables & QR Codes', icon: QrCode },
    { id: 'waiter_mgmt', label: 'Waiter Management', icon: Users },
    { id: 'cook_mgmt', label: 'Cook Management', icon: ChefHat },
    { id: 'delivery_mgmt', label: 'Delivery Management', icon: Bike },
    { id: 'billing', label: 'Billing & Payments', icon: Receipt },
    { id: 'reviews', label: 'Customer Reviews', icon: MessageSquare },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Restaurant Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#151515] flex flex-col md:flex-row text-[#D1D5DB] font-sans selection:bg-[#FFC400] selection:text-black">
      {/* Mobile Header Bar */}
      <div className="md:hidden bg-[#222222] text-white px-4 py-3 flex items-center justify-between border-b border-[#353535]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="cursor-pointer p-1 rounded-lg text-[#D1D5DB] hover:text-white"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-black text-sm uppercase text-white">KRISPIER Admin</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="cursor-pointer relative p-1.5 text-[#D1D5DB] hover:text-[#FFC400]"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#FFC400] rounded-full ring-2 ring-[#222222]" />
            )}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-[#151515] text-[#D1D5DB] flex flex-col shrink-0 border-r border-[#353535] z-30`}
      >
        {/* Brand header */}
        <div className="p-6 border-b border-[#353535] flex items-center justify-between bg-[#151515]">
          <KrispierLogo size="md" />
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setSidebarOpen(false);
                }}
                className={`cursor-pointer w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-[#FFC400] text-black shadow-md'
                    : 'text-[#D1D5DB] hover:text-white hover:bg-[#222222]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-black stroke-[2.5]' : 'text-[#A0A0A0]'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User profile & Logout */}
        <div className="p-4 border-t border-[#353535] bg-[#1a1a1a]">
          <div className="flex items-center justify-between mb-3">
            <div className="min-w-0 pr-2">
              <div className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</div>
              <div className="text-[10px] text-[#FFC400] font-black uppercase tracking-wider">{user?.role || 'Admin'}</div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] shrink-0" title="Online" />
          </div>

          <button
            type="button"
            onClick={logout}
            className="cursor-pointer w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#222222] hover:bg-[#EF4444] text-white hover:text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors border border-[#353535]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#151515]">
        {/* Top Header Bar for Desktop */}
        <header className="hidden md:flex bg-[#222222] border-b border-[#353535] px-8 py-4 items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-lg font-black text-white uppercase tracking-wider">
              {menuItems.find((m) => m.id === currentTab)?.label || 'Dashboard'}
            </h1>
            <p className="text-xs text-[#D1D5DB]">Krispier Kasur Restaurant Management & Operations</p>
          </div>

          <div className="flex items-center gap-4 relative">
            {/* Real-time Notifications Bell */}
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="cursor-pointer relative p-2.5 rounded-xl text-[#D1D5DB] hover:text-white hover:bg-[#2d2d2d] transition-colors border border-[#353535]"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-[#FFC400] text-black font-black text-[10px] rounded-full tabular-nums">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="absolute right-0 top-14 w-80 sm:w-96 bg-[#222222] rounded-2xl shadow-2xl border border-[#353535] p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-[#353535]">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    Kitchen Alerts ({unreadCount} new)
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowNotifications(false)}
                    className="cursor-pointer text-xs font-bold text-[#A0A0A0] hover:text-white"
                  >
                    Close
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-[#353535] py-2">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[#888888]">
                      No notifications at this time.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        className={`py-2.5 px-2 text-xs transition-colors rounded-xl flex items-start justify-between gap-2 ${
                          notif.read ? 'opacity-60 hover:bg-[#151515]' : 'bg-[#151515] border border-[#FFC400]/30'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-white">{notif.title}</div>
                          <div className="text-[#D1D5DB] text-[11px] mt-0.5">{notif.message}</div>
                          <div className="text-[10px] text-[#FFC400] mt-1 font-mono">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>

                        {!notif.read && (
                          <button
                            type="button"
                            onClick={() => handleMarkAsRead(notif._id)}
                            className="cursor-pointer text-[#FFC400] hover:text-white p-1 shrink-0"
                            title="Mark as read"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="h-6 w-px bg-[#353535]" />

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#FFC400] text-black font-black text-sm flex items-center justify-center">
                K
              </div>
              <div className="text-xs">
                <span className="font-bold text-white block leading-tight">{user?.name}</span>
                <span className="text-[#FFC400] text-[10px] uppercase font-bold tracking-wider">
                  Super Administrator
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 bg-[#151515]">{children}</main>
      </div>
    </div>
  );
};
