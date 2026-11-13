import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { FoodItem, Category, Review } from './types';
import { api } from './services/api';

// Public Website Components
import { Navbar } from './components/public/Navbar';
import { HeroSection } from './components/public/HeroSection';
import { StorySection } from './components/public/StorySection';
import { SignatureDishes } from './components/public/SignatureDishes';
import { MenuSection } from './components/public/MenuSection';
import { ItemModal } from './components/public/ItemModal';
import { CartDrawer } from './components/public/CartDrawer';
import { ReservationSection } from './components/public/ReservationSection';
import { ReviewsSection } from './components/public/ReviewsSection';
import { ContactFooter } from './components/public/ContactFooter';

// Customer Table QR Menu
import { TableMenu } from './components/table/TableMenu';

// Admin Components
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminOrders } from './components/admin/AdminOrders';
import { AdminMenu } from './components/admin/AdminMenu';
import { AdminCategories } from './components/admin/AdminCategories';
import { AdminTables } from './components/admin/AdminTables';
import { AdminStaff } from './components/admin/AdminStaff';
import { AdminBilling } from './components/admin/AdminBilling';
import { AdminReviews } from './components/admin/AdminReviews';
import { AdminReports } from './components/admin/AdminReports';
import { AdminSettings } from './components/admin/AdminSettings';

// Staff Dashboards
import { WaiterDashboard } from './components/staff/WaiterDashboard';
import { CookDashboard } from './components/staff/CookDashboard';
import { DeliveryDashboard } from './components/staff/DeliveryDashboard';

function MainApp() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Route routing state based on window.location
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname);
  const [queryParams, setQueryParams] = useState<URLSearchParams>(
    () => new URLSearchParams(window.location.search)
  );

  // Admin Tab selection
  const [adminTab, setAdminTab] = useState<string>('dashboard');

  // Public menu & modal states
  const [categories, setCategories] = useState<Category[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [publicDataError, setPublicDataError] = useState<string | null>(null);

  // Listen to popstate (back/forward browser buttons)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      setQueryParams(new URLSearchParams(window.location.search));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Programmatic router navigate
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(window.location.pathname);
    setQueryParams(new URLSearchParams(window.location.search));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load public menu and review data for the storefront
  useEffect(() => {
    const reportLoadError = (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unexpected API response.';
      setPublicDataError((current) => current ? `${current} ${message}` : message);
    };

    api.getCategories().then(setCategories).catch(reportLoadError);
    api.getFoods().then(setFoods).catch(reportLoadError);
    api.getReviews().then(setReviews).catch(reportLoadError);
  }, []);

  // Handle post-login redirection based on role
  const handleLoginSuccess = (role: string) => {
    if (role === 'admin') {
      navigate('/admin');
    } else if (role === 'waiter') {
      navigate('/waiter');
    } else if (role === 'cook') {
      navigate('/cook');
    } else if (role === 'delivery') {
      navigate('/delivery');
    }
  };

  // Scroll to section helpers for public landing page
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // ROUTE 3: /menu?table=T01 (Customer QR Table Ordering)
  if (currentPath === '/menu' || queryParams.has('table')) {
    const tableNum = queryParams.get('table') || 'T01';
    return <TableMenu tableNumber={tableNum} />;
  }

  // ROUTE 4: /waiter (Waiter Dashboard)
  if (currentPath === '/waiter') {
    if (authLoading) return <div className="min-h-screen bg-[#151515]" />;
    if (!isAuthenticated || (user?.role !== 'waiter' && user?.role !== 'admin')) {
      return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
    }
    return <WaiterDashboard />;
  }

  // ROUTE 5: /cook (Cook Kitchen Display System)
  if (currentPath === '/cook') {
    if (authLoading) return <div className="min-h-screen bg-[#151515]" />;
    if (!isAuthenticated || (user?.role !== 'cook' && user?.role !== 'admin')) {
      return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
    }
    return <CookDashboard />;
  }

  // ROUTE 6: /delivery (Delivery Rider Dashboard)
  if (currentPath === '/delivery') {
    if (authLoading) return <div className="min-h-screen bg-[#151515]" />;
    if (!isAuthenticated || (user?.role !== 'delivery' && user?.role !== 'admin')) {
      return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
    }
    return <DeliveryDashboard />;
  }

  // ROUTE 2: /admin or /admin/dashboard (Admin Portal)
  if (currentPath.startsWith('/admin')) {
    if (authLoading) {
      return <div className="min-h-screen bg-[#151515]" />;
    }

    if (!isAuthenticated) {
      return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
    }

    // If an employee logged in at /admin, route them to their assigned role dashboard
    if (user?.role === 'waiter') {
      return <WaiterDashboard />;
    }
    if (user?.role === 'cook') {
      return <CookDashboard />;
    }
    if (user?.role === 'delivery') {
      return <DeliveryDashboard />;
    }

    // Render Admin SaaS Dashboard
    return (
      <AdminLayout currentTab={adminTab} onTabChange={setAdminTab}>
        {adminTab === 'dashboard' && <AdminDashboard onNavigateTab={setAdminTab} />}
        {adminTab === 'orders' && <AdminOrders />}
        {adminTab === 'food_menu' && <AdminMenu />}
        {adminTab === 'categories' && <AdminCategories />}
        {adminTab === 'tables_qr' && <AdminTables />}
        {adminTab === 'waiter_mgmt' && <AdminStaff initialRoleFilter="waiter" />}
        {adminTab === 'cook_mgmt' && <AdminStaff initialRoleFilter="cook" />}
        {adminTab === 'delivery_mgmt' && <AdminStaff initialRoleFilter="delivery" />}
        {adminTab === 'billing' && <AdminBilling />}
        {adminTab === 'reviews' && <AdminReviews />}
        {adminTab === 'reports' && <AdminReports />}
        {adminTab === 'settings' && <AdminSettings />}
      </AdminLayout>
    );
  }

  // ROUTE 1: / (Pure Public Restaurant Website)
  // STRICT RULE: No admin buttons, no admin links, no dashboard links anywhere here!
  return (
    <div className="min-h-screen bg-[#151515] text-[#D1D5DB] flex flex-col font-sans selection:bg-[#FFC400] selection:text-black">
      <Navbar />

      {publicDataError && (
        <div role="alert" className="bg-[#3b1d1d] border-y border-[#7f1d1d] px-4 py-3 text-sm text-red-200">
          Menu and review data could not be loaded: {publicDataError}
        </div>
      )}

      <HeroSection
        onExploreMenu={() => scrollToSection('menu')}
        onOrderNow={() => scrollToSection('menu')}
      />

      <StorySection />

      <SignatureDishes foods={foods} onSelectItem={setSelectedFood} />

      <MenuSection
        categories={categories}
        foods={foods}
        onSelectItem={setSelectedFood}
      />

      <ReservationSection />

      <ReviewsSection
        reviews={reviews}
        onReviewAdded={(newRev) => setReviews((prev) => [newRev, ...prev])}
      />

      <ContactFooter />

      {/* Food Details & Customization Modal */}
      <ItemModal food={selectedFood} onClose={() => setSelectedFood(null)} />

      {/* Shopping Cart Drawer for Delivery & Takeaway */}
      <CartDrawer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}
