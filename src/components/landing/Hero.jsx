import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Wallet, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import arcbyteLogo from '../../assets/arcbyte.co Logo_white_transparent.png';
export default function Hero() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#151518] w-full min-h-[900px] relative px-8 pt-6 pb-20 overflow-hidden text-white font-sans">

      {/* Navigation */}
      <nav className="flex items-center justify-between mb-24 max-w-[1200px] mx-auto z-50 relative">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] stroke-[2.5]" />
          <span className="text-lg sm:text-xl font-bold tracking-tight text-white">ArcPay</span>
          <div className="w-[1px] h-4 sm:h-5 bg-white/20 mx-0.5 sm:mx-1"></div>
          <img src={arcbyteLogo} alt="ArcByte" className="h-5 sm:h-6 opacity-90 object-contain" />
        </div>

        <div className="hidden lg:flex items-center gap-8 text-[15px] text-zinc-300 font-medium tracking-wide">
          <a href="#" className="hover:text-white transition-colors">Projects</a>
          <a href="#" className="hover:text-white transition-colors">Products</a>
          <a href="#" className="hover:text-white transition-colors">Community</a>
          <a href="#" className="hover:text-white transition-colors">Company</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <button className="whitespace-nowrap px-4 py-2 sm:px-6 sm:py-2.5 rounded-full border border-zinc-600 hover:bg-white/5 transition-colors text-[13px] sm:text-sm font-semibold">
            Log in
          </button>
          <button className="whitespace-nowrap px-4 py-2 sm:px-6 sm:py-2.5 rounded-full bg-white text-black hover:bg-zinc-200 transition-colors text-[13px] sm:text-sm font-semibold">
            Sign up
          </button>
        </div>
      </nav>

      {/* Main Hero Content */}
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">

        {/* Left Typography Block */}
        <div className="pt-10">
          <h1 className="text-5xl sm:text-7xl lg:text-[80px] font-bold leading-[1.05] tracking-[-0.03em] mb-6 drop-shadow-sm">
            Seamless UPI<br />
            payments for<br />
            your business
            <span className="inline-block ml-2 sm:ml-4 align-middle pb-1 sm:pb-2 w-8 h-8 sm:w-12 sm:h-12">
              {/* Pristine 4-point Sparkle SVG */}
              <svg viewBox="0 0 24 24" className="w-full h-full text-[#75f2c6] animate-pulse">
                <path fill="currentColor" d="M12 0C12 6.627 17.373 12 24 12C17.373 12 12 17.373 12 24C12 17.373 6.627 12 0 12C6.627 12 12 6.627 12 0Z" />
              </svg>
            </span>
          </h1>

          <p className="text-zinc-400 text-lg max-w-[420px] mb-12 font-medium leading-relaxed">
            Generate highly converting, intent-driven payment links that securely route transactions through native UPI applications.
          </p>

          <button
            onClick={() => navigate('/app')}
            className="flex items-center gap-3 bg-[#0d6dfd] hover:bg-blue-600 transition-colors rounded-full pl-8 pr-2 py-2 mb-20 shadow-[0_0_30px_rgba(13,109,253,0.4)] group"
          >
            <span className="font-semibold tracking-wide">Try for Free</span>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center transform group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-5 h-5 text-black" />
            </div>
          </button>

          {/* Social Proof Stats */}
          <div className="flex items-center gap-6">
            <div className="flex -space-x-3">
              <div className="w-12 h-12 rounded-full border-2 border-[#151518] overflow-hidden bg-zinc-800">
                <img src="https://i.pravatar.cc/150?u=1" alt="user" className="w-full h-full object-cover" />
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-[#151518] overflow-hidden bg-zinc-800">
                <img src="https://i.pravatar.cc/150?u=2" alt="user" className="w-full h-full object-cover" />
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-[#151518] overflow-hidden bg-zinc-800">
                <img src="https://i.pravatar.cc/150?u=3" alt="user" className="w-full h-full object-cover" />
              </div>
            </div>
            <div>
              <p className="font-bold text-lg leading-tight">10.2k+</p>
              <p className="text-[11px] text-zinc-500 font-medium max-w-[120px] leading-snug">Active users around the worlds</p>
            </div>
          </div>
        </div>

        {/* Right Column Content Container */}
        <div className="relative pt-10 flex-1 flex items-center justify-center">
          {/* Intentionally blank per user request */}
        </div>

      </div>

      {/* Bottom Global Stats */}
      <div className="relative mt-12 sm:mt-20 lg:mt-0 lg:absolute lg:bottom-12 lg:right-20 flex flex-wrap justify-center lg:justify-end gap-8 sm:gap-12 z-20 w-full lg:w-auto">
        <div className="text-center lg:text-left">
          <p className="text-2xl sm:text-3xl font-bold mb-1 text-white">0%</p>
          <p className="text-[10px] sm:text-xs text-zinc-500 font-medium">Platform Fees</p>
        </div>
        <div className="text-center lg:text-left">
          <p className="text-2xl sm:text-3xl font-bold mb-1 text-white">100%</p>
          <p className="text-[10px] sm:text-xs text-zinc-500 font-medium">Secure Delivery</p>
        </div>
        <div className="text-center lg:text-left">
          <p className="text-2xl sm:text-3xl font-bold mb-1 text-white">Instant</p>
          <p className="text-[10px] sm:text-xs text-zinc-500 font-medium">UPI Routing</p>
        </div>
      </div>
    </div>
  );
}
