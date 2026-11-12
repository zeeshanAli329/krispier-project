import React from 'react';
import { Flame, Sparkles, Award, HeartHandshake } from 'lucide-react';

export const StorySection: React.FC = () => {
  return (
    <section id="about" className="py-24 bg-[#151515] border-b border-[#353535]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Image with natural frame */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] bg-[#222222] border border-[#353535]">
              <img
                src="/src/assets/images/hero_krispier_feast_1794472994683.jpg"
                alt="Krispier Kasur signature crispy feast"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Subtle floating quote accent */}
            <div className="mt-4 p-5 bg-[#222222] border border-[#353535] rounded-xl">
              <p className="text-sm italic text-[#D1D5DB]">
                "Every bite must deliver unmistakable golden crunch on the outside, succulent juicy tenderness inside, and explosive depth from our signature dips."
              </p>
              <div className="mt-2 text-xs font-bold text-[#FFC400]">— The Krispier Kitchen Masters, Kasur</div>
            </div>
          </div>

          {/* Right Column: Editorial story */}
          <div className="lg:col-span-7 space-y-6">
            <div className="text-xs font-bold tracking-widest uppercase text-[#FFC400] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FFC400]"></span>
              <span>The Krispier Standard · Kasur</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase leading-tight">
              Delight In Every Sauce, Crunch In Every Bite
            </h2>
            <p className="text-[#D1D5DB] leading-relaxed">
              Born in Kasur, Pakistan, <span className="text-white font-bold">KRISPIER</span> set out with a bold vision: to redefine fast food with authentic handcrafted crunch, prime chicken breasts marinated in 12 proprietary spices, and our celebrated lineup of proprietary dipping sauces. From flaming chipotle to sweet-and-smoky BBQ and signature creamy garlic herb, we believe exceptional sauce elevates fast food into an unforgettable craving.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#222222] border border-[#353535] flex items-center justify-center text-[#FFC400] shrink-0">
                  <Flame className="w-5 h-5 fill-[#FFC400] text-[#FFC400]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Pressure Fried Broast</h3>
                  <p className="text-xs text-[#D1D5DB] mt-1">High-pressure frying locks in natural juices while creating an ultra-crisp batter.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#222222] border border-[#353535] flex items-center justify-center text-[#FFC400] shrink-0">
                  <Sparkles className="w-5 h-5 text-[#FFC400]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Secret Signature Sauces</h3>
                  <p className="text-xs text-[#D1D5DB] mt-1">Crafted in small batches with imported chilies, honey, and garlic butter.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#222222] border border-[#353535] flex items-center justify-center text-[#FFC400] shrink-0">
                  <Award className="w-5 h-5 text-[#FFC400]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">100% Fresh Halal Poultry</h3>
                  <p className="text-xs text-[#D1D5DB] mt-1">Fresh daily farm delivery. Never frozen, double-dredged by hand.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#222222] border border-[#353535] flex items-center justify-center text-[#FFC400] shrink-0">
                  <HeartHandshake className="w-5 h-5 text-[#FFC400]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Kasur Hospitality</h3>
                  <p className="text-xs text-[#D1D5DB] mt-1">Family dining ambiance with lightning-fast QR ordering at every table.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
