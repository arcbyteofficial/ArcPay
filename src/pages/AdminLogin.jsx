import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  ArrowRight,
  ChevronLeft,
  Smartphone,
  LockKeyhole,
  CheckCircle2,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../context/NotificationContext';
import arcbyteLogo from '../assets/arcbyte_logo_white_transparent.png';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

// ArcPay Theme Styles 
const ArcPayEditorialStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;900&display=swap');
    
    .font-brand { font-family: 'Inter', sans-serif; }
    
    .neon-text-shadow {
      text-shadow: 0 0 20px rgba(212, 255, 63, 0.4);
    }
    
    .arcpay-border { border-color: rgba(212, 255, 63, 0.1); }
  `}</style>
);

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [tempToken, setTempToken] = useState(null);

  const navigate = useNavigate();
  const { showStatus } = useNotification();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (data.success) {
        if (data.require2FA) {
          setTempToken(data.tempToken);
          setRequires2FA(true);
          showStatus({
            type: 'info',
            title: 'IDENTITY SECURE',
            message: 'A security code is required to access your account.'
          });
          return;
        }

        localStorage.setItem('arcpay_token', data.token);
        localStorage.setItem('arcpay_merchant', data.businessName);
        showStatus({
          type: 'success',
          title: 'ACCESS GRANTED',
          message: `Welcome, ${data.businessName}. Signing you in...`
        });
        navigate('/arc-gate/portal');
      } else {
        showStatus({
          type: 'error',
          title: 'ACCESS DENIED',
          message: data.error || "The email or password entered is incorrect."
        });
      }
    } catch (err) {
      showStatus({
        type: 'error',
        title: 'CONNECTION ERROR',
        message: "Unable to connect to the server."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, code: otpCode })
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('arcpay_token', data.token);
        localStorage.setItem('arcpay_merchant', data.businessName);
        showStatus({
          type: 'success',
          title: 'VERIFIED',
          message: "You are now signed in."
        });
        navigate('/arc-gate/portal');
      } else {
        showStatus({
          type: 'error',
          title: 'INVALID CODE',
          message: data.error || "The security code is incorrect."
        });
      }
    } catch (err) {
      showStatus({
        type: 'error',
        title: 'CONNECTION ERROR',
        message: "Confirmation failure."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-brand selection:bg-[#d4ff3f] selection:text-[#000000]">
      <ArcPayEditorialStyles />
      
      {/* Masthead Header */}
      <header className="fixed top-0 left-0 right-0 p-8 flex justify-between items-center z-50 border-b border-white/[0.03]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#d4ff3f] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(212,255,63,0.3)]">
            <ShieldCheck className="w-5 h-5 text-black stroke-[3]" />
          </div>
          <span className="text-[10px] font-black tracking-[0.5em] uppercase text-zinc-500 pl-4 border-l border-white/10">ArcPay Admin Login</span>
        </div>
        <button className="text-zinc-500 hover:text-[#d4ff3f] transition-colors">
          <Menu className="w-5 h-5" />
        </button>
      </header>

      <main className="min-h-screen pt-32 p-8 md:p-24 flex flex-col md:flex-row gap-16 md:gap-32 max-w-[1600px] mx-auto">
        {/* LEFT COMPONENT: HERO BRANDING */}
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-[#d4ff3f] text-[11px] font-black uppercase tracking-[0.8em] mb-8 opacity-60">Admin / 01</h2>
            <h1 className="text-5xl md:text-6xl lg:text-[80px] font-black leading-[0.85] tracking-[-0.05em] text-white uppercase italic">
              The <br />
              <span className="text-[#d4ff3f] neon-text-shadow">Portal</span> <br />
              to Commerce.
            </h1>
          </motion.div>
        </div>

        {/* RIGHT COMPONENT: SECURE FORM */}
        <div className="w-full md:w-[400px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {!requires2FA ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-16"
              >
                <div className="space-y-2">
                  <h3 className="text-[#d4ff3f] text-2xl font-black uppercase italic tracking-tighter">Sign In.</h3>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                    Enter your details to access the admin area.
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-10">
                  <div className="space-y-12">
                    <div className="relative group">
                      <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.4em] mb-4">Official Email</p>
                      <input 
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ADMIN@ARCPAY.COM"
                        className="w-full bg-transparent border-b border-white/10 py-4 text-xs font-black tracking-[0.2em] outline-none focus:border-[#d4ff3f] transition-all uppercase placeholder:text-zinc-900"
                      />
                    </div>

                    <div className="relative group">
                      <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.4em] mb-4">Password</p>
                      <input 
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-transparent border-b border-white/10 py-4 text-xs font-black tracking-[0.2em] outline-none focus:border-[#d4ff3f] transition-all placeholder:text-zinc-900"
                      />
                    </div>
                  </div>

                  <button 
                    disabled={isLoading}
                    className="group relative w-full h-16 bg-[#d4ff3f] text-black font-black text-[12px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 active:scale-[0.98] transition-all overflow-hidden shadow-[0_0_30px_rgba(212,255,63,0.15)]"
                  >
                    <div className="absolute inset-x-0 bottom-0 h-0 group-hover:h-full bg-white/10 transition-all duration-300" />
                    <span className="relative z-10">{isLoading ? "Signing in..." : "Sign In"}</span>
                    {!isLoading && <ArrowRight className="relative z-10 w-4 h-4 transition-transform group-hover:translate-x-2" />}
                  </button>
                </form>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[9px] font-black text-zinc-800 uppercase tracking-widest border-t border-white/5 pt-8">
                  <span className="cursor-pointer hover:text-[#d4ff3f] transition-colors">Key Recovery</span>
                  <span className="cursor-pointer hover:text-[#d4ff3f] transition-colors">Admin Support</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="2fa"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-16"
              >
                <div className="space-y-6">
                  <div className="w-12 h-12 bg-[#d4ff3f] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(212,255,63,0.3)]">
                    <LockKeyhole className="w-5 h-5 text-black stroke-[3]" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-[#d4ff3f] text-2xl font-black uppercase italic tracking-tighter">Security.</h3>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                      Verification required. Enter the 6-digit code to continue.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleVerify2FA} className="space-y-12">
                  <div className="relative group">
                    <div className="flex justify-between items-center mb-6">
                      <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.4em]">Auth Code</p>
                      <button type="button" onClick={() => setRequires2FA(false)} className="text-[9px] font-black text-zinc-800 hover:text-[#d4ff3f] transition-colors uppercase tracking-[0.2em]">Return</button>
                    </div>
                    <input 
                      type="text"
                      required
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="000 000"
                      autoFocus
                      className="w-full bg-transparent border-b border-white/10 py-6 text-5xl font-black text-white tracking-[0.3em] outline-none focus:border-[#d4ff3f] transition-all placeholder:text-zinc-950 text-center uppercase"
                    />
                  </div>

                  <button 
                    disabled={isLoading || otpCode.length !== 6}
                    className="group relative w-full h-16 bg-[#d4ff3f] text-black font-black text-[12px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 active:scale-[0.98] transition-all overflow-hidden shadow-[0_0_30px_rgba(212,255,63,0.15)]"
                  >
                    <div className="absolute inset-x-0 bottom-0 h-0 group-hover:h-full bg-white/10 transition-all duration-300" />
                    <span className="relative z-10">{isLoading ? "Verifying..." : "Sign In"}</span>
                    {!isLoading && <ArrowRight className="relative z-10 w-4 h-4" />}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Editorial Footer Decoration */}
      <footer className="relative md:fixed bottom-0 left-0 right-0 p-8 flex flex-col md:flex-row justify-between items-center md:items-end z-10 gap-8 md:gap-0 mt-20 md:mt-0">
        <div className="space-y-1 opacity-20 text-center md:text-left">
          <p className="text-[10px] font-black tracking-[1em] uppercase text-white">ARCPAY ADMIN</p>
          <div className="h-[2px] w-32 bg-[#d4ff3f] mx-auto md:mx-0" />
        </div>
        <div className="text-center md:text-right opacity-30">
          <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-[0.4em] mb-3">Secure Admin Portal</p>
          <div className="flex gap-1 justify-center md:justify-end">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="w-0.5 h-3 bg-white" />)}
          </div>
        </div>
      </footer>
    </div>
  );
}
