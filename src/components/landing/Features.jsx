import React from 'react';

const Card = ({ icon: Icon, title, desc, iconBg }) => (
  <div className="bg-white rounded-[40px] p-12 text-center shadow-xl relative overflow-hidden group hover:-translate-y-2 transition-transform duration-500">
    {/* Subtle grid background */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(circle_50%_at_50%_50%,#000_20%,transparent_100%)] opacity-50 pointer-events-none"></div>

    <div className="relative z-10 flex flex-col items-center">
      <div className="mb-8">
        {Icon}
      </div>
      <h3 className="text-2xl text-[#111111] mb-4">{title}</h3>
      <p className="text-[#888888] font-medium leading-relaxed max-w-[240px] text-[15px]">
        {desc}
      </p>
    </div>
  </div>
);

export default function Features() {
  return (
    <div className="bg-[#f8f9fc] w-full px-4 md:px-8 pb-16 md:pb-32 pt-12 md:pt-20 font-sans">

      {/* Logos Marquee Mock */}
      <div className="flex overflow-hidden space-x-6 mb-16 md:mb-32 -mx-4 md:-mx-8 px-4 md:px-8 max-w-[1400px]">
        <div className="flex space-x-6 animate-[marquee_20s_linear_infinite] shrink-0">
          {['Rakuten', 'VICE', 'DELL', 'Upwork', 'Paypal', 'Stripe', 'Google', 'Amazon'].map((brand, i) => (
            <div key={i} className="bg-white px-10 py-5 rounded-[30px] shadow-sm flex items-center justify-center min-w-[200px]">
              <span className="font-black text-2xl tracking-tighter text-[#111] opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                {brand}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center max-w-[600px] mx-auto mb-16 md:mb-20">
        <h2 className="text-4xl sm:text-[52px] md:text-6xl text-[#111] mb-4 sm:mb-6 font-black leading-tight tracking-tight">
          Everything you need <br />
          <span className="text-[#888]">to get paid</span>
        </h2>
        <p className="text-[#666] font-medium text-base sm:text-lg px-4 sm:px-0">
          Simple, fast, and free. No hidden charges or complicated steps to get started.
        </p>
      </div>

      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card
          title="Safe Payments"
          desc="Your money is always protected with the highest bank-level security standards."
          Icon={
            <div className="relative">
              <svg width="72" height="72" viewBox="0 0 24 24" fill="#111" className="drop-shadow-lg">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d4ff3f" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
          }
        />

        <Card
          title="Direct Transfers"
          desc="Money goes straight into your bank account. No waiting for days to get your funds."
          Icon={
            <div className="relative w-[72px] h-[72px]">
              <div className="absolute inset-0 bg-[#111] rounded-full drop-shadow-lg" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, 50% 50%, 100% 50%, 100% 0)' }}></div>
              <div className="absolute top-0 right-0 w-8 h-8 bg-[#d4ff3f] rounded-full drop-shadow-lg transform translate-x-1 -translate-y-1"></div>
            </div>
          }
        />

        <Card
          title="Works Everywhere"
          desc="Your customers can pay using any app they already have like GPay or PhonePe."
          Icon={
            <svg width="72" height="72" viewBox="0 0 24 24" className="drop-shadow-lg">
              <rect x="2" y="2" width="20" height="20" rx="6" fill="#111" />
              <rect x="7" y="14" width="3" height="4" rx="1" fill="#d4ff3f" />
              <rect x="14" y="8" width="3" height="10" rx="1" fill="#d4ff3f" />
            </svg>
          }
        />
      </div>

    </div>
  );
}
