import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ChevronRight, Mail, Lock, Building2, ArrowRight } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useNotification } from '../context/NotificationContext';
import arcbyteLogo from '../assets/arcbyte_logo_white_transparent.png';
import { useRef } from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export default function AdminSetup() {
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showStatus } = useNotification();

  const handleSetup = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(`${BACKEND_URL}/api/auth/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, businessName }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (data.success) {
        showStatus({ 
          type: 'success', 
          title: 'IDENTITY LOCKED', 
          message: "Merchant identity established. Terminal is now operational. Proceeding to Login." 
        });
        navigate('/admin/login');
      } else {
        showStatus({ 
          type: 'error', 
          title: 'SECURE verification FAILURE', 
          message: data.error || "Setup failed. System may already be locked for security." 
        });
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        showStatus({ 
          type: 'error', 
          title: 'PROTOCOL TIMEOUT', 
          message: "Request exceed 10s latency. Please check secure node status." 
        });
      } else {
        showStatus({ 
          type: 'error', 
          title: 'GATEWAY FAILURE', 
          message: "Unable to establish secure verification with authentication server." 
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#d4ff3f]/[0.02] rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#d4ff3f]/[0.01] rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-8 h-8 text-[#d4ff3f]" strokeWidth={2.5} />
            <div className="w-[1px] h-6 bg-white/20 mx-1"></div>
            <img src={arcbyteLogo} alt="ArcByte" className="h-8 opacity-90 object-contain grayscale brightness-200" />
          </div>
          <h2 className="text-5xl mb-4 italic-center-balance">ArcPay <span className="text-[#d4ff3f]">Setup</span></h2>
          <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.4em]">Initialize Your Business Profile</p>
        </div>

        <form onSubmit={handleSetup} className="space-y-12">
          <div className="space-y-10">
            <div className="relative group border-b border-white/[0.05] focus-within:border-[#d4ff3f]/40 transition-colors pb-4">
              <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em] mb-4">Business Email</p>
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-zinc-700 mr-4 shrink-0" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@business.com"
                  className="w-full bg-transparent outline-none text-white font-black text-2xl tracking-tighter placeholder:text-zinc-900 transition-all font-sans"
                />
              </div>
            </div>

            <div className="relative group border-b border-white/[0.05] focus-within:border-[#d4ff3f]/40 transition-colors pb-4">
              <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em] mb-4">Create Password</p>
              <div className="flex items-center">
                <Lock className="w-5 h-5 text-zinc-700 mr-4 shrink-0" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent outline-none text-white font-black text-2xl tracking-tighter placeholder:text-zinc-900 transition-all font-sans"
                />
              </div>
            </div>

            <div className="relative group border-b border-white/[0.05] focus-within:border-[#d4ff3f]/40 transition-colors pb-4">
              <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em] mb-4">Store Name</p>
              <div className="flex items-center">
                <Building2 className="w-5 h-5 text-zinc-700 mr-4 shrink-0" />
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Organization name"
                  className="w-full bg-transparent outline-none text-white font-black text-2xl tracking-tighter placeholder:text-zinc-900 transition-all font-sans"
                />
              </div>
            </div>
          </div>

          <div className="pt-8">
            <SlideToSubmit
              onComplete={() => {
                const form = document.querySelector('form');
                if (form.checkValidity()) {
                  handleSetup({ preventDefault: () => { } });
                } else {
                  form.reportValidity();
                }
              }}
              text="SLIDE TO START"
              isLoading={isLoading}
            />
          </div>
        </form>

        <p className="text-zinc-800 text-[9px] font-black uppercase tracking-[0.3em] text-center leading-loose">
          One-time setup. These credentials will be used for all future logins.
        </p>
      </motion.div>
    </div>
  );
}

const SlideToSubmit = ({ onComplete, text, isLoading }) => {
  const containerRef = useRef(null);
  const x = useMotionValue(0);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-[64px] bg-[#151518] rounded-full overflow-hidden flex items-center border border-white/10 shadow-[inset_0_4px_10px_rgba(0,0,0,0.5)] transition-all duration-500",
        isLoading && "opacity-50 pointer-events-none"
      )}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-zinc-500 font-extrabold tracking-[0.25em] text-[10px] uppercase">
          {isLoading ? "Processing..." : text}
        </span>
      </div>

      <motion.div
        drag={isLoading ? false : "x"}
        style={{ x }}
        dragConstraints={{ left: 0, right: containerRef.current ? containerRef.current.offsetWidth - 68 : 300 }}
        dragElastic={0.05}
        dragSnapToOrigin={true}
        onDragEnd={(e, info) => {
          if (!isLoading && containerRef.current) {
            const trackWidth = containerRef.current.offsetWidth;
            // Completion threshold: 80% of the available track
            if (x.get() > (trackWidth - 80)) {
              onComplete();
            }
          }
        }}
        animate={!isLoading ? { x: [0, 8, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
        className={cn(
          "absolute left-1.5 top-1.5 bottom-1.5 w-[52px] bg-[#d4ff3f] rounded-full flex items-center justify-center z-10",
          isLoading ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing shadow-[0_0_20px_rgba(117,242,198,0.4)]"
        )}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
        ) : (
          <ArrowRight className="w-5 h-5 text-black stroke-[3px]" />
        )}
      </motion.div>
    </div>
  );
};
