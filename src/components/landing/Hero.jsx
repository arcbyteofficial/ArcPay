import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#151518] w-full min-h-[900px] relative px-8 pt-6 pb-20 overflow-hidden text-white font-sans">
      
      {/* Navigation */}
      <nav className="flex items-center justify-between mb-24 max-w-[1200px] mx-auto z-50 relative">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#75f2c6] rounded-[4px] shadow-[0_0_15px_rgba(117,242,198,0.4)]"></div>
          <span className="text-xl font-bold tracking-tight">ArcPay</span>
        </div>
        
        <div className="hidden lg:flex items-center gap-8 text-[15px] text-zinc-300 font-medium tracking-wide">
          <a href="#" className="hover:text-white transition-colors">Projects</a>
          <a href="#" className="hover:text-white transition-colors">Products</a>
          <a href="#" className="hover:text-white transition-colors">Community</a>
          <a href="#" className="hover:text-white transition-colors">Company</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="px-6 py-2.5 rounded-full border border-zinc-600 hover:bg-white/5 transition-colors text-sm font-semibold">
            Log in
          </button>
          <button className="px-6 py-2.5 rounded-full bg-white text-black hover:bg-zinc-200 transition-colors text-sm font-semibold">
            Sign up
          </button>
        </div>
      </nav>

      {/* Main Hero Content */}
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
        
        {/* Left Typography Block */}
        <div className="pt-10">
          <h1 className="text-6xl sm:text-7xl lg:text-[80px] font-bold leading-[1.05] tracking-[-0.03em] mb-6 drop-shadow-sm">
            Digital payments<br />
            made for digital<br />
            creators
            <span className="inline-block ml-4 align-middle pb-2">
              {/* Teal Star SVG exactly like mockup */}
              <svg width="48" height="48" viewBox="0 0 100 100" className="text-[#75f2c6] animate-pulse">
                <path fill="currentColor" d="M43.08 6.54c3.48-6.17 12.36-6.17 15.84 0l8.7 15.4c1.8 3.2 5.39 4.8 9.04 4.04l16.89-3.52c6.76-1.41 12.04 4.67 10.15 11.23l-4.73 16.4c-1 3.47.16 7.21 2.92 9.42l13.72 10.98c5.49 4.39 3.52 13.3-3.4 15.5l-17.37 5.53c-3.59 1.14-6.07 4.36-6.25 8.12l-.46 18.04c-.18 7.22-8.54 10.66-14.44 6.13l-14.8-11.4c-3.06-2.35-7.3-2.35-10.36 0l-14.8 11.4c-5.9 4.53-14.26 1.09-14.44-6.13l-.46-18.04c-.18-3.76-2.66-6.98-6.25-8.12L4.03 82.1C-2.89 79.9-4.86 70.99.63 66.6l13.72-10.98c2.76-2.21 3.92-5.95 2.92-9.42l-4.73-16.4c-1.89-6.56 3.39-12.64 10.15-11.23l16.89 3.52c3.65.76 7.24-.84 9.04-4.04l8.46-15.01z" opacity="0.9" />
              </svg>
            </span>
          </h1>
          
          <p className="text-zinc-400 text-lg max-w-[420px] mb-12 font-medium leading-relaxed">
            Since 2013, we've guided millions of global users on their digital financial journey.
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

        {/* Right Floating Cards Block */}
        <div className="relative pt-10 h-[500px]">
          {/* Top/Back Card */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute top-10 right-0 w-[440px] h-[260px] rounded-[28px] overflow-hidden shadow-2xl backdrop-blur-xl border border-white/20 z-10 origin-bottom-right"
            style={{ 
              transform: 'perspective(1000px) rotateX(15deg) rotateY(-20deg) rotateZ(10deg)', 
              background: 'linear-gradient(135deg, rgba(230,230,250,1) 0%, rgba(135,206,235,1) 40%, rgba(255,105,180,0.8) 100%)'
            }}
          >
             {/* VISA Header */}
             <div className="absolute top-6 right-8 text-white font-black text-2xl tracking-widest drop-shadow-md">VISA</div>
             <div className="absolute top-8 left-8">
               <Wallet className="w-6 h-6 text-white/80" />
             </div>
             
             {/* Card Details */}
             <div className="absolute bottom-8 left-8 w-full pr-16 text-white">
                <div className="font-mono text-2xl tracking-[4px] mb-4 drop-shadow-md brightness-110">
                  1253  5432  3521  3090
                </div>
                <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider drop-shadow-md opacity-90 pr-4">
                  <span>Zahra Mohamadi</span>
                  <span>Exp 09/24</span>
                </div>
             </div>
             {/* Glass Overlay for depth */}
             <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-white/10 mix-blend-overlay"></div>
             <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/40 to-transparent"></div>
          </motion.div>

          {/* Bottom/Front Card */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: [0, -10, 0], opacity: 1 }}
            transition={{ y: { repeat: Infinity, duration: 6, ease: "easeInOut" }, opacity: { duration: 1, delay: 0.2 } }}
            className="absolute top-44 -left-10 w-[420px] h-[240px] rounded-[28px] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] backdrop-blur-3xl border border-white/10 z-20"
            style={{ 
              transform: 'perspective(1000px) rotateX(25deg) rotateY(-15deg) rotateZ(15deg)', 
              background: 'linear-gradient(to right bottom, #0088ff 0%, #0044ff 40%, #151515 90%)'
            }}
          >
            {/* Glossy top section */}
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-cyan-400/30 to-transparent opacity-80 mix-blend-screen"></div>

             {/* Details mapped identically to image */}
             <div className="absolute bottom-20 left-8">
                <div className="font-mono text-2xl tracking-[4px] text-white/90 drop-shadow-md font-medium">
                  1253  5402  ****  ****
                </div>
             </div>
             <div className="absolute bottom-6 left-8 flex gap-20 text-[10px] text-zinc-400 font-semibold uppercase">
                <div className="flex flex-col">
                  <span className="mb-1">Exp</span>
                  <span className="text-white text-xs">09/24</span>
                </div>
                <div className="flex flex-col">
                  <span className="mb-1">CVV</span>
                  <span className="text-white text-xs">341</span>
                </div>
             </div>
             <div className="absolute bottom-6 right-8 text-white/20">
               <svg viewBox="0 0 100 100" className="w-12 h-12">
                 <circle cx="30" cy="50" r="20" fill="currentColor"/>
                 <circle cx="60" cy="50" r="20" fill="currentColor" className="mix-blend-overlay"/>
               </svg>
             </div>
          </motion.div>

          {/* Artistic squiggly line from mockup */}
          <div className="absolute bottom-0 right-10">
            <svg width="120" height="80" viewBox="0 0 120 80" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M10 70 C 20 20, 60 100, 80 40 C 90 10, 110 30, 115 20 M 80 40 C 90 80, 50 10, 30 50" />
            </svg>
          </div>
        </div>

      </div>

      {/* Bottom Global Stats */}
      <div className="absolute bottom-12 right-20 flex gap-12 z-20">
        <div>
          <p className="text-3xl font-bold mb-1 text-white">15y</p>
          <p className="text-xs text-zinc-500 font-medium">Experience</p>
        </div>
        <div>
          <p className="text-3xl font-bold mb-1 text-white">230+</p>
          <p className="text-xs text-zinc-500 font-medium">Merchant Partner</p>
        </div>
        <div>
          <p className="text-3xl font-bold mb-1 text-white">8.4k+</p>
          <p className="text-xs text-zinc-500 font-medium">Worldwide Clients</p>
        </div>
      </div>
    </div>
  );
}
