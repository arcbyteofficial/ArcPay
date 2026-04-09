import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Settings, ChevronLeft, Wallet, ShieldCheck, Zap } from 'lucide-react';

export default function Showcase() {
  return (
    <div className="w-full font-sans">

      {/* Dark App Showcase Section */}
      <div className="bg-[#151518] px-8 py-32 relative overflow-hidden">

        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">

          {/* Left Block */}
          <div className="flex flex-col z-10 text-center lg:text-left items-center lg:items-start">
            <h2 className="text-4xl sm:text-5xl text-white mb-6 font-black leading-tight">
              Make it <br className="hidden sm:block" />
              <span className="text-[#d4ff3f]">your own</span>
            </h2>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-[280px] mb-12">
              Choose a design you like for your payment link. Make it look exactly how you want in seconds.
            </p>

            <div className="mb-12 drop-shadow-[0_0_15px_rgba(212,255,63,0.2)]">
              <Zap className="w-16 h-16 text-[#d4ff3f]" />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300 shadow-xl">
                <div className="text-left">
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest leading-none mb-1">Download on</p>
                  <p className="text-sm font-bold text-white leading-none">App Store</p>
                </div>
              </button>
              <button className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300 shadow-xl">
                <div className="text-left">
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest leading-none mb-1">Get it on</p>
                  <p className="text-sm font-bold text-white leading-none">Google Play</p>
                </div>
              </button>
            </div>
          </div>

          {/* Center Mobile Mockup */}
          <div className="flex justify-center z-10 relative mt-8 lg:mt-0">
            <div className="w-full max-w-[300px] h-[600px] bg-white rounded-[40px] shadow-2xl p-4 relative border-8 border-white mx-auto">
              <div className="flex items-center justify-between px-2 pt-4 mb-6">
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                  <ChevronLeft className="w-4 h-4 text-zinc-600" />
                </div>
                <span className="font-bold text-[#111]">Payment Link</span>
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                  <Settings className="w-4 h-4 text-zinc-600" />
                </div>
              </div>

              <div className="w-full h-[180px] rounded-2xl p-5 relative overflow-hidden shadow-lg mb-8 bg-gradient-to-br from-[#0066ff] to-[#111]">
                <div className="absolute top-5 right-5 text-white font-black text-lg tracking-widest opacity-20">UPI</div>
                <div className="absolute bottom-16 left-5 font-mono text-lg tracking-widest text-white/90 font-medium">
                  {'\u20B9'}10,000.00
                </div>
                <div className="absolute bottom-5 left-5 text-[10px] text-white/60 font-bold uppercase">
                  Balance
                </div>
              </div>

              <div className="flex gap-4 mb-8 px-2">
                <button className="flex-1 bg-[#111] text-white py-3 rounded-xl text-sm font-semibold">Share</button>
                <button className="flex-1 bg-zinc-100 text-[#111] py-3 rounded-xl text-sm font-semibold">Save</button>
              </div>

              <div className="px-2">
                <div className="text-xs text-zinc-400 font-semibold uppercase mb-1">Received Today</div>
                <div className="text-3xl font-black text-[#111] mb-6">{"\u20B9"}1,050</div>
                
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-[#111]">Customer Payment</div>
                    <div className="text-xs text-zinc-400">9:41 AM</div>
                  </div>
                  <div className="text-sm font-black text-green-600">+{"\u20B9"}500</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Block */}
          <div className="flex flex-col justify-center items-center lg:items-start z-10 pl-0 lg:pl-10 text-center lg:text-left mt-10 lg:mt-0">
            <h2 className="text-3xl sm:text-4xl text-white mb-8 sm:mb-10 font-black leading-tight">
              Track your <br className="hidden sm:block" />
              <span className="text-[#d4ff3f]">payments</span>
            </h2>
            <p className="text-zinc-500 text-base font-medium leading-relaxed max-w-[280px] mb-10">
              See everything in one place so you always know where your money is. No complicated charts.
            </p>

            <button className="flex items-center gap-4 bg-[#d4ff3f] hover:bg-[#c4ed3a] transition-all rounded-full pl-6 pr-2 py-2 group shadow-xl">
              <span className="font-black text-black text-sm">Get Started</span>
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center transform group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-5 h-5 text-black" />
              </div>
            </button>
          </div>

        </div>
      </div>

      {/* Light Section */}
      <div className="bg-[#f8f9fc] px-4 md:px-8 py-20 lg:py-32 overflow-hidden flex flex-col items-center">
        <h2 className="text-2xl sm:text-3xl md:text-[40px] text-[#111] mb-16 lg:mb-20 text-center font-black leading-tight">
          Works on any phone. <br className="hidden sm:block" /> Simple and easy to use.
        </h2>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-6 max-w-[1200px] w-full">
          {/* Card 1 */}
          <div className="w-full max-w-[320px] h-[450px] bg-[#0066ff] rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl lg:-rotate-2">
             <h3 className="text-3xl font-black mb-4">All Brands <br/> Supported</h3>
             <p className="opacity-70 text-sm">Accept payments from any UPI app instantly.</p>
             <div className="absolute -bottom-10 -right-10 w-full h-[200px] bg-white/10 rounded-3xl rotate-12 blur-2xl"></div>
          </div>

          {/* Card 2 */}
          <div className="w-full max-w-[340px] h-[480px] bg-white rounded-[32px] p-8 text-[#111] relative overflow-hidden shadow-2xl z-10 lg:-translate-y-4">
             <ShieldCheck className="w-12 h-12 text-blue-600 mb-6" />
             <h3 className="text-3xl font-black mb-4">Always <br/> Secure</h3>
             <p className="text-zinc-500 font-medium">Focus on your business, we handle the security.</p>
             <div className="absolute -bottom-20 -right-20 w-[200px] h-[200px] bg-blue-500/5 rounded-full blur-3xl"></div>
          </div>

          {/* Card 3 */}
          <div className="w-full max-w-[320px] h-[450px] bg-[#111] rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl lg:rotate-2">
             <h3 className="text-3xl font-black mb-4">Pick your <br/> design</h3>
             <p className="opacity-70 text-sm">Choose from many beautiful payment link styles.</p>
             <div className="absolute -bottom-10 -left-10 w-full h-[200px] bg-[#d4ff3f]/10 rounded-3xl -rotate-12 blur-2xl"></div>
          </div>
        </div>

      </div>
    </div>
  );
}
