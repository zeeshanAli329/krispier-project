import React from 'react';
import { MapPin, Phone, Mail, Clock, ExternalLink, Instagram } from 'lucide-react';
import { KrispierLogo } from '../common/KrispierLogo';

export const ContactFooter: React.FC = () => {
  return (
    <footer id="contact" className="bg-[#151515] text-[#D1D5DB] pt-20 pb-12 border-t border-[#353535]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Col */}
          <div className="space-y-4">
            <KrispierLogo size="md" />
            <p className="text-xs text-[#D1D5DB] leading-relaxed">
              Kasur's premier crispy fast-food destination. Hand-breaded crunch, flame-grilled patties, and our authentic proprietary dipping sauces.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.instagram.com/krispier_kasur/"
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-[#222222] hover:bg-[#FFC400] text-white hover:text-black rounded-lg text-xs font-bold transition-all border border-[#353535]"
              >
                <Instagram className="w-4 h-4" />
                <span>@krispier_kasur</span>
              </a>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Krispier+Kasur"
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer flex items-center gap-1 px-3 py-1.5 bg-[#222222] hover:bg-[#FFC400] text-white hover:text-black rounded-lg text-xs font-bold transition-all border border-[#353535]"
              >
                <span>Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="text-xs text-[#888888]">
              © {new Date().getFullYear()} KRISPIER. All rights reserved.
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-white tracking-wider uppercase border-l-2 border-[#FFC400] pl-2">
              Menu & Sections
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#about" className="cursor-pointer text-[#D1D5DB] hover:text-[#FFC400] transition-colors block">
                  The Krispier Story
                </a>
              </li>
              <li>
                <a href="#signature" className="cursor-pointer text-[#D1D5DB] hover:text-[#FFC400] transition-colors block">
                  Crispy Broast & Combos
                </a>
              </li>
              <li>
                <a href="#menu" className="cursor-pointer text-[#D1D5DB] hover:text-[#FFC400] transition-colors block">
                  Full Menu & Prices
                </a>
              </li>
              <li>
                <a href="#reservation" className="cursor-pointer text-[#D1D5DB] hover:text-[#FFC400] transition-colors block">
                  Family Table Booking
                </a>
              </li>
              <li>
                <a href="#reviews" className="cursor-pointer text-[#D1D5DB] hover:text-[#FFC400] transition-colors block">
                  Kasur Diners' Reviews
                </a>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-white tracking-wider uppercase border-l-2 border-[#FFC400] pl-2">
              Kitchen Hours
            </h4>
            <div className="space-y-3 text-xs text-[#D1D5DB]">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#FFC400] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Daily Kitchen & Dine-In</div>
                  <div>01:00 PM – 02:00 AM (Late Night)</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5 pt-1">
                <Clock className="w-4 h-4 text-[#FFC400] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Kasur City Delivery</div>
                  <div>01:30 PM – 01:30 AM</div>
                </div>
              </div>
            </div>
          </div>

          {/* Location & Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-white tracking-wider uppercase border-l-2 border-[#FFC400] pl-2">
              Kasur Restaurant
            </h4>
            <div className="space-y-3 text-xs text-[#D1D5DB]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#FFC400] shrink-0 mt-0.5" />
                <span>Main Ferozepur Road, Opposite Sports Stadium, Kasur, Punjab, Pakistan</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#FFC400] shrink-0" />
                <a href="tel:+923004882200" className="cursor-pointer hover:text-[#FFC400] font-bold text-white">
                  +92 300 4882200
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#FFC400] shrink-0" />
                <span className="text-[#D1D5DB]">orders@krispier.pk</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#353535] flex flex-col sm:flex-row items-center justify-between text-xs text-[#888888] gap-4">
          <p>Freshly fried to order in Kasur · Delight In Every Sauce.</p>
          <div className="flex gap-6">
            <span className="cursor-pointer hover:text-[#FFC400]">Halal Certified</span>
            <span className="cursor-pointer hover:text-[#FFC400]">Terms & Conditions</span>
            <span className="cursor-pointer hover:text-[#FFC400]">Allergen Info</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
