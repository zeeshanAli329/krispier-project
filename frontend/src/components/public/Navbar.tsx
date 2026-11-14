import React, { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X, PhoneCall } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { KrispierLogo } from '../common/KrispierLogo';

export const Navbar: React.FC = () => {
  const { itemCount, setIsCartOpen } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-200 ${
        isScrolled
          ? 'bg-[#151515] border-b border-[#353535] py-3 shadow-xl'
          : 'bg-[#151515] border-b border-[#353535]/50 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6">
          {/* Zone 1: Official Krispier Logo */}
          <a
            href="/"
            className="flex items-center gap-2 cursor-pointer shrink-0 transition-opacity hover:opacity-90"
            aria-label="KRISPIER Kasur Homepage"
          >
            <KrispierLogo size="md" />
          </a>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold uppercase tracking-wider text-[#D1D5DB]">
            <a
              href="#deals"
              className="hover:text-[#FFC400] transition-colors whitespace-nowrap cursor-pointer"
            >
              Special Deals
            </a>
            <a
              href="#signature"
              className="hover:text-[#FFC400] transition-colors whitespace-nowrap cursor-pointer"
            >
              Popular Items
            </a>
            <a
              href="#menu"
              className="hover:text-[#FFC400] transition-colors whitespace-nowrap cursor-pointer"
            >
              Full Menu
            </a>
            <a
              href="#about"
              className="hover:text-[#FFC400] transition-colors whitespace-nowrap cursor-pointer"
            >
              Our Story
            </a>
            <a
              href="#reviews"
              className="hover:text-[#FFC400] transition-colors whitespace-nowrap cursor-pointer"
            >
              Reviews
            </a>
            <a
              href="#contact"
              className="hover:text-[#FFC400] transition-colors whitespace-nowrap cursor-pointer"
            >
              Kasur Outlet
            </a>
          </nav>

          {/* Zone 3: Actions - Delivery Call Hotline + Cart / Order Now */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="tel:+923004882200"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#FFC400] bg-[#222222] border border-[#353535] hover:border-[#FFC400] rounded-lg transition-colors cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#FFC400]" />
              <span className="font-mono">0300-4882200</span>
            </a>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative inline-flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-[#151515] bg-[#FFC400] hover:bg-[#FFB800] active:bg-[#E0A800] rounded-lg transition-colors shadow-md cursor-pointer whitespace-nowrap shrink-0"
              aria-label="View Cart and Order Now"
            >
              <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
              <span>Order Now</span>
              {itemCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[11px] font-black bg-[#151515] text-[#FFC400] rounded-full tabular-nums">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#D1D5DB] hover:text-[#FFC400] bg-[#222222] border border-[#353535] rounded-lg cursor-pointer transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-[#353535] pb-2 space-y-1 bg-[#151515]">
            <a
              href="#deals"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#D1D5DB] hover:text-[#151515] hover:bg-[#FFC400] rounded-lg transition-colors cursor-pointer"
            >
              Special Deals
            </a>
            <a
              href="#signature"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#D1D5DB] hover:text-[#151515] hover:bg-[#FFC400] rounded-lg transition-colors cursor-pointer"
            >
              Popular Items
            </a>
            <a
              href="#menu"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#D1D5DB] hover:text-[#151515] hover:bg-[#FFC400] rounded-lg transition-colors cursor-pointer"
            >
              Full Menu
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#D1D5DB] hover:text-[#151515] hover:bg-[#FFC400] rounded-lg transition-colors cursor-pointer"
            >
              Our Story
            </a>
            <a
              href="#reviews"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#D1D5DB] hover:text-[#151515] hover:bg-[#FFC400] rounded-lg transition-colors cursor-pointer"
            >
              Customer Reviews
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#D1D5DB] hover:text-[#151515] hover:bg-[#FFC400] rounded-lg transition-colors cursor-pointer"
            >
              Kasur Outlet & Contact
            </a>
          </div>
        )}
      </div>
    </header>
  );
};
