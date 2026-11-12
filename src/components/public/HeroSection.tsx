import React from 'react';
import { ArrowRight, Flame, Sparkles, Clock, MapPin, CheckCircle2 } from 'lucide-react';

interface HeroSectionProps {
  onExploreMenu: () => void;
  onOrderNow: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreMenu, onOrderNow }) => {
  return (
    <section className="relative min-h-[92vh] flex items-center bg-[#151515] pt-28 pb-16 border-b border-[#353535]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Bold Editorial Fast Food Copy */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Tagline kicker badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#222222] border border-[#353535] text-xs font-extrabold uppercase tracking-widest text-[#FFC400]">
              <Flame className="w-3.5 h-3.5 text-[#FFC400]" />
              <span>Official Krispier Kasur</span>
              <span className="text-[#353535]">|</span>
              <span className="text-white">Fast Food Landmark</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black text-white tracking-tight leading-[1.05] uppercase">
              Delight In <br />
              <span className="text-[#FFC400]">Every Sauce.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#D1D5DB] max-w-xl leading-relaxed">
              Experience Kasur’s crispiest fried chicken, loaded smash zingers, and piping-hot cheesy pizzas served with an unforgettable lineup of signature dipping sauces.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={onOrderNow}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#FFC400] hover:bg-[#FFB800] active:bg-[#E0A800] text-[#151515] font-black text-sm uppercase tracking-wider rounded-xl shadow-lg transition-colors cursor-pointer"
              >
                <span>Order Online Now</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>

              <button
                onClick={onExploreMenu}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#222222] hover:bg-[#2d2d2d] active:bg-[#1a1a1a] text-white hover:text-[#FFC400] border border-[#353535] hover:border-[#FFC400] font-extrabold text-sm uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                <span>Explore Full Menu</span>
              </button>
            </div>

            {/* Highlights Strip */}
            <div className="pt-8 border-t border-[#353535] grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-[#222222] border border-[#353535] p-3 rounded-xl">
                <div className="text-[#FFC400] font-black text-xs uppercase">Secret Sauces</div>
                <div className="text-[11px] text-[#D1D5DB] mt-0.5">Crafted house dips</div>
              </div>

              <div className="bg-[#222222] border border-[#353535] p-3 rounded-xl">
                <div className="text-[#FFC400] font-black text-xs uppercase">Fresh & Hot</div>
                <div className="text-[11px] text-[#D1D5DB] mt-0.5">Fried fresh on order</div>
              </div>

              <div className="bg-[#222222] border border-[#353535] p-3 rounded-xl col-span-2 sm:col-span-1">
                <div className="text-[#FFC400] font-black text-xs uppercase">Kasur Delivery</div>
                <div className="text-[11px] text-[#D1D5DB] mt-0.5">Express doorstep dispatch</div>
              </div>
            </div>
          </div>

          {/* Right Column: High-Impact Photography Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border-2 border-[#353535] bg-[#222222] shadow-2xl group">
              <img
                src="/src/assets/images/hero_krispier_feast_1794472994683.jpg"
                alt="KRISPIER signature crispy feast with burgers, pizza, chicken and sauces"
                referrerPolicy="no-referrer"
                className="w-full aspect-[4/3] object-cover group-hover:scale-102 transition-transform duration-300"
              />

              {/* Tag overlay */}
              <div className="absolute top-4 left-4 bg-[#151515] border border-[#FFC400] px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-[#FFC400]" />
                <span className="text-[11px] font-black uppercase text-white tracking-wider">
                  Mega Crunch Feast
                </span>
              </div>

              {/* Price Callout */}
              <div className="absolute bottom-4 right-4 bg-[#151515] border border-[#353535] px-4 py-2 rounded-xl text-right shadow-xl">
                <div className="text-[10px] uppercase font-bold text-[#D1D5DB]">Feast Deal</div>
                <div className="text-xl font-black text-[#FFC400] tabular-nums">PKR 2,450</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
