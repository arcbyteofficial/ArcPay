import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ShieldAlert, Zap, Globe, Smartphone, ShieldCheck, Server, Activity } from 'lucide-react';
import arcbyteLogo from '../assets/arcbyte_logo_white_transparent.png';
import SEO from '../components/common/SEO';

export default function Maintenance() {
  const [timeLeft, setTimeLeft] = useState({ h: '00', m: '00', s: '00' });
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/api/public/settings`);
        const data = await response.json();
        setSettings(data);
      } catch (err) {
        console.error("Failed to fetch maintenance status");
      }
    };

    fetchSettings();
    const interval = setInterval(fetchSettings, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!settings?.maintenanceEndTime) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(settings.maintenanceEndTime).getTime() - now;

      if (distance < 0) {
        setTimeLeft({ h: '00', m: '00', s: '00' });
        clearInterval(timer);
        return;
      }

      const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({
        h: h.toString().padStart(2, '0'),
        m: m.toString().padStart(2, '0'),
        s: s.toString().padStart(2, '0')
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [settings]);

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col relative overflow-hidden font-sans selection:bg-[#d4ff3f]/30">
      <SEO 
        title="System Maintenance" 
        description="ArcPay is currently undergoing updates to improve our payment system."
        noindex={true}
      />
      
      {/* EDITORIAL GRID BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 grid grid-cols-4 md:grid-cols-12 h-full w-full">
          {[...Array(13)].map((_, i) => (
            <div key={i} className="border-r border-white/5 h-full" />
          ))}
        </div>
        <div className="absolute inset-0 flex flex-col justify-between py-[10vh]">
          <div className="h-[1px] w-full bg-white/5" />
          <div className="h-[1px] w-full bg-white/5" />
          <div className="h-[1px] w-full bg-white/5" />
        </div>
      </div>

      {/* MASSIVE BACKGROUND WATERMARK */}
      <div className="absolute -left-[5%] top-1/2 -translate-y-1/2 rotate-90 md:rotate-0 flex flex-col gap-0 select-none opacity-[0.03] pointer-events-none">
        <span className="text-[15vh] md:text-[30vh] font-black leading-none tracking-tighter">ARCPAY</span>
        <span className="text-[15vh] md:text-[30vh] font-black leading-none tracking-tighter outline-text">ARCPAY</span>
      </div>

      {/* TOP STATUS BAR - MOBILE HARDENED */}
      <div className="relative z-20 w-full px-6 md:px-12 py-6 md:py-8 flex items-center justify-between border-b border-white/[0.03] bg-[#050505]/50 backdrop-blur-xl">
        <div className="flex items-center gap-3 md:gap-4">
          <img src={arcbyteLogo} alt="ArcByte" className="h-4 md:h-5 opacity-80" />
          <div className="hidden md:block w-[1px] h-4 bg-white/10" />
          <span className="hidden md:block text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">System</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-4 h-4 bg-[#d4ff3f]/20 rounded-full blur-md animate-pulse" />
              <div className="w-1.5 h-1.5 bg-[#d4ff3f] relative z-10" />
            </div>
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-[#d4ff3f] whitespace-nowrap">System Status</span>
          </div>
          <div className="h-3 w-[1px] bg-white/10" />
          <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 whitespace-nowrap">Status: Active</span>
        </div>
      </div>

      {/* MAIN CONTENT AREA - STACKED HERO LAYOUT */}
      <main className="flex-1 relative z-10 flex flex-col justify-center px-6 md:px-20 py-12 md:py-20">
        <div className="max-w-7xl mx-auto w-full space-y-12 md:space-y-20">
          
          {/* HERO TYPOGRAPHY - FULL WIDTH */}
          <div className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="px-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <span className="px-3 py-1 bg-[#d4ff3f] text-black text-[10px] font-black uppercase tracking-widest rounded-full">System Update</span>
                <span className="text-zinc-600 text-[10px] font-black uppercase tracking-widest hidden sm:inline">Version 2.0</span>
              </div>
              <h1 className="text-[clamp(2rem,10vw,8rem)] text-white break-words italic-center-balance">
                DOWN FOR <br />
                <span className="text-[#d4ff3f]">MAINTENANCE</span>
              </h1>
            </motion.div>
          </div>

          <div className="w-full">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 }}
              className="max-w-4xl text-zinc-400 font-bold text-lg md:text-2xl leading-relaxed uppercase tracking-tight"
            >
              {settings?.maintenanceMessage || "We are currently making some key improvements to the ArcPay system. The platform will be back online in just a few moments."}
            </motion.p>
          </div>
        </div>
      </main>

      {/* BOTTOM ACTION BAR - MOBILE HARDENED */}
      <footer className="relative z-20 w-full px-6 md:px-12 py-8 md:py-10 border-t border-white/[0.03] flex flex-col xl:flex-row items-center justify-between gap-10 bg-[#050505]/50 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-center gap-8 md:gap-16 w-full xl:w-auto">
        </div>

        <div className="flex items-center gap-10">
          <a href="#" className="flex items-center gap-2 group transition-all">
            <Globe className="w-4 h-4 text-zinc-600 group-hover:text-[#d4ff3f]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white">Site Status</span>
          </a>
          <a href="#" className="flex items-center gap-2 group transition-all">
            <Zap className="w-4 h-4 text-zinc-600 group-hover:text-[#d4ff3f]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white">Help Center</span>
          </a>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .outline-text {
          -webkit-text-stroke: 1px rgba(255,255,255,0.05);
          color: transparent;
        }
        .italic-editorial {
          font-family: 'Plus Jakarta Sans', sans-serif !important;
          transform: skewX(-5deg);
        }
        @media (max-width: 768px) {
          .italic-editorial {
            transform: none;
          }
        }
      `}} />
    </div>
  );
}
