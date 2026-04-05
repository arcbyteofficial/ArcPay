import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Settings, ChevronLeft, Wallet } from 'lucide-react';

export default function Showcase() {
  return (
    <div className="w-full font-sans">
      
      {/* Dark App Showcase Section */}
      <div className="bg-[#151518] px-8 py-32 relative overflow-hidden">
        
        {/* Abstract squiggly right */}
        <div className="absolute top-20 right-20 opacity-60">
           <svg width="150" height="150" viewBox="0 0 120 80" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M10 70 C 20 20, 60 100, 80 40 C 90 10, 110 30, 115 20 M 80 40 C 90 80, 50 10, 30 50" />
            </svg>
        </div>

        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          
          {/* Left Block */}
          <div className="flex flex-col z-10">
            <h2 className="text-5xl font-black text-white tracking-[-0.04em] leading-[1.1] mb-6">
              Find the<br />
              <span className="text-[#75f2c6]">Perfect</span><br />
              Payment Link
            </h2>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-[280px] mb-12">
              You have the freedom to personalize the design of your payment link, ensuring a truly unique experience that makes you feel extraordinary.
            </p>
            
            <div className="mb-12 drop-shadow-[0_0_15px_rgba(117,242,198,0.2)]">
              {/* Teal Asterisk */}
              <svg width="64" height="64" viewBox="0 0 100 100" className="text-[#75f2c6]">
                <path fill="currentColor" d="M43.08 6.54c3.48-6.17 12.36-6.17 15.84 0l8.7 15.4c1.8 3.2 5.39 4.8 9.04 4.04l16.89-3.52c6.76-1.41 12.04 4.67 10.15 11.23l-4.73 16.4c-1 3.47.16 7.21 2.92 9.42l13.72 10.98c5.49 4.39 3.52 13.3-3.4 15.5l-17.37 5.53c-3.59 1.14-6.07 4.36-6.25 8.12l-.46 18.04c-.18 7.22-8.54 10.66-14.44 6.13l-14.8-11.4c-3.06-2.35-7.3-2.35-10.36 0l-14.8 11.4c-5.9 4.53-14.26 1.09-14.44-6.13l-.46-18.04c-.18-3.76-2.66-6.98-6.25-8.12L4.03 82.1C-2.89 79.9-4.86 70.99.63 66.6l13.72-10.98c2.76-2.21 3.92-5.95 2.92-9.42l-4.73-16.4c-1.89-6.56 3.39-12.64 10.15-11.23l16.89 3.52c3.65.76 7.24-.84 9.04-4.04l8.46-15.01z" opacity="0.9" />
              </svg>
            </div>
            
            <div className="flex gap-4">
              {/* Fake store buttons */}
              <div className="h-12 w-32 bg-white rounded-md flex items-center justify-center cursor-pointer hover:bg-zinc-200 transition-colors">
                 <span className="text-black font-bold text-xs">App Store</span>
              </div>
              <div className="h-12 w-32 bg-white rounded-md flex items-center justify-center cursor-pointer hover:bg-zinc-200 transition-colors">
                 <span className="text-black font-bold text-xs">Google Play</span>
              </div>
            </div>
          </div>

          {/* Center Mobile Mockup */}
          <div className="flex justify-center z-10 relative">
            <div className="w-[300px] h-[600px] bg-white rounded-[40px] shadow-2xl p-4 relative border-8 border-white">
               {/* Phone header */}
               <div className="flex items-center justify-between px-2 pt-4 mb-6">
                 <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                   <ChevronLeft className="w-4 h-4 text-zinc-600" />
                 </div>
                 <span className="font-bold text-[#111]">ArcPay Link</span>
                 <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                   <Settings className="w-4 h-4 text-zinc-600" />
                 </div>
               </div>

               {/* Simulated App Card */}
               <div className="w-full h-[180px] rounded-2xl p-5 relative overflow-hidden shadow-lg mb-8"
                  style={{ background: 'linear-gradient(to right bottom, #0088ff 0%, #0044ff 40%, #151515 90%)' }}>
                 <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-cyan-400/30 to-transparent opacity-80 mix-blend-screen"></div>
                 <div className="absolute top-5 right-5 text-white font-black text-lg tracking-widest drop-shadow-md">UPI</div>
                 <div className="absolute bottom-16 left-5 font-mono text-lg tracking-widest text-white/90 drop-shadow-md font-medium">
                  {'\u20B9'}10,000.00
                 </div>
                 <div className="absolute bottom-5 left-5 flex gap-10 text-[8px] text-zinc-400 font-semibold uppercase">
                    <div className="flex flex-col">
                      <span className="mb-1">Name</span>
                      <span className="text-white text-[10px]">Aidan R.</span>
                    </div>
                 </div>
               </div>

               <div className="flex gap-4 mb-8 px-2">
                 <button className="flex-1 bg-[#111] text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                   + Share Link
                 </button>
                 <button className="flex-1 bg-zinc-100 text-[#111] py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                   Download
                 </button>
               </div>

               <div className="px-2">
                 <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wide mb-1">Total Received</div>
                 <div className="text-3xl font-black text-[#111] mb-6">{"\u20B9"}1050.99</div>
                 
                 <div className="text-sm font-bold text-[#111] mb-4">Today, 27 Sep</div>
                 {/* Transaction Mock */}
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                     <Wallet className="w-5 h-5 text-blue-600" />
                   </div>
                   <div className="flex-1">
                     <div className="text-sm font-bold text-[#111]">Rent Payment</div>
                     <div className="text-xs text-zinc-400 font-medium">9:41 AM</div>
                   </div>
                   <div className="text-sm font-black text-green-600">+{"\u20B9"}500</div>
                 </div>
               </div>
            </div>
          </div>

          {/* Right Block */}
          <div className="flex flex-col justify-center items-start z-10 pl-10">
            <h2 className="text-4xl font-black text-white tracking-[-0.04em] leading-[1.1] mb-10">
              Easy Way to<br />
              <span className="text-[#75f2c6]">Manage your</span><br />
              Finance
            </h2>
            
            <button className="flex items-center gap-4 bg-[#75f2c6] hover:bg-[#5cdba6] transition-colors rounded-full pl-6 pr-2 py-2 group shadow-[0_0_30px_rgba(117,242,198,0.3)]">
              <span className="font-black text-[#111] tracking-wide text-sm">Create New</span>
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center transform group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-5 h-5 text-black" />
              </div>
            </button>
          </div>

        </div>
      </div>

      {/* Light Mobile Screens Spread Section */}
      <div className="bg-[#f8f9fc] px-8 py-32 overflow-hidden flex flex-col items-center">
        <h2 className="text-3xl md:text-[40px] font-medium text-[#111] italic mb-20 text-center tracking-tight">
          Easy to use mobile app that support on<br />android and ios.
        </h2>

        <div className="flex items-center justify-center gap-6 max-w-[1200px] w-full">
          {/* Mock Screen 1 */}
          <div className="w-[320px] h-[500px] bg-[#0066ff] rounded-[32px] p-6 relative overflow-hidden shadow-xl transform -rotate-3 hover:rotate-0 transition-transform duration-500">
             <h3 className="text-3xl font-bold text-white tracking-tight mb-2">Visa<br/>Support</h3>
             <div className="absolute top-8 right-8 text-white">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6"><path d="M12 2v20M17 5l-10 14M22 12H2M19 17L5 7"/></svg>
             </div>
             <motion.div 
               className="absolute -bottom-10 -right-10 w-[300px] h-[180px] rounded-2xl shadow-2xl"
               style={{ background: 'linear-gradient(135deg, rgba(230,230,250,1) 0%, rgba(135,206,235,1) 40%, rgba(255,105,180,0.8) 100%)', transform: 'rotate(-15deg)' }}
             >
               <div className="absolute top-4 right-6 text-white font-black text-xl">VISA</div>
               <div className="absolute bottom-4 left-6 font-mono text-white tracking-widest">32 3521 3090</div>
             </motion.div>
          </div>

          {/* Mock Screen 2 */}
          <div className="w-[340px] h-[540px] bg-[#e6f0ff] rounded-[32px] p-8 relative overflow-hidden shadow-2xl z-10 transform -translate-y-4 hover:-translate-y-6 transition-transform duration-500">
             <motion.div 
               className="absolute -top-10 -left-10 w-[320px] h-[200px] rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
               style={{ background: 'linear-gradient(to right bottom, #0088ff 0%, #0044ff 40%, #151515 90%)', transform: 'rotate(20deg)' }}
             >
               <div className="absolute bottom-4 right-6 text-white font-black text-2xl">VISA</div>
               <div className="absolute top-8 left-6 font-mono text-white tracking-widest transform rotate-180">5432 3521</div>
             </motion.div>
             <h3 className="absolute bottom-10 inset-x-0 text-center text-3xl font-black text-[#111] tracking-tighter">
               Always there
             </h3>
          </div>

          {/* Mock Screen 3 */}
          <div className="w-[320px] h-[500px] bg-[#111] rounded-[32px] p-8 relative overflow-hidden shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-500 text-white">
             <h3 className="text-[34px] font-medium tracking-tight leading-none mb-1">
               Design your<br />
               <span className="text-[#75f2c6] font-bold">Personalized</span><br />
               <span className="text-zinc-500/50 mix-blend-screen text-4xl">Card</span>
             </h3>
             <motion.div 
               className="absolute -bottom-4 right-4 w-[280px] h-[170px] rounded-[24px] shadow-2xl"
               style={{ background: 'linear-gradient(135deg, rgba(230,230,250,1) 0%, rgba(135,206,235,1) 40%, rgba(255,105,180,0.8) 100%)', transform: 'rotate(-5deg)' }}
             >
               <div className="absolute top-4 left-6 font-mono text-white tracking-widest text-sm rotate-90 origin-left flex items-start text-nowrap">Zahra Mohamadi</div>
               <div className="absolute top-8 right-6 text-white/50"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M4 12V4a2 2 0 012-2h12a2 2 0 012 2v8M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M4 12h16"/></svg></div>
             </motion.div>
          </div>
        </div>

      </div>
    </div>
  );
}
