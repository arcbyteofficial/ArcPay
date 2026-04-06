import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { ArrowRight, Wallet, ShieldCheck, Percent, Zap, ArrowLeft, Smartphone, Check, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import arcbyteLogo from '../../assets/arcbyte.co Logo_white_transparent.png';
import heroImg from '../../assets/hero.png';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Sub-component: CharacterFade for slider text
const CharacterFade = ({ text, x, maxDistance = 120 }) => {
  const characters = text.split('');
  return (
    <div className="flex">
      {characters.map((char, index) => {
        const threshold = (index / characters.length) * maxDistance;
        const charOpacity = useTransform(x, [threshold, threshold + 25], [1, 0]);
        return (
          <motion.span key={index} style={{ opacity: charOpacity }} className="inline-block px-[0.5px]">
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        );
      })}
    </div>
  );
};

// Sub-component: SlideToClose slider
const SlideToClose = ({ onComplete }) => {
  const containerRef = useRef(null);
  const x = useMotionValue(0);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[64px] bg-[#151518] rounded-full overflow-hidden flex items-center shadow-inner mt-10 border border-white/5"
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="text-zinc-500 font-bold tracking-[0.2em] text-xs">
          <CharacterFade text="SLIDE TO CLOSE" x={x} />
        </span>
      </div>

      <motion.div
        drag="x"
        style={{ x }}
        dragConstraints={{ left: 0, right: 280 }}
        dragElastic={0.05}
        dragSnapToOrigin={true}
        onDragEnd={(e, info) => {
          if (containerRef.current) {
            const trackWidth = containerRef.current.offsetWidth;
            if (info.offset.x > trackWidth * 0.7) {
              onComplete();
            }
          }
        }}
        className="absolute left-1.5 top-1.5 bottom-1.5 w-[52px] bg-zinc-800 border border-white/10 rounded-full flex items-center justify-center z-10 cursor-grab active:cursor-grabbing shadow-[0_0_15px_rgba(0,0,0,0.5)]"
      >
        <ArrowLeft className="w-5 h-5 text-zinc-500" />
      </motion.div>
    </div>
  );
};

// Sheet for 6-digit access code verification
const AccessCodeSheet = ({ isOpen, onClose, onVerified }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputs = useRef([]);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);

  // Persistence Key
  const L_KEY = 'arc_auth_strikes';
  const T_KEY = 'arc_auth_lockout';

  useEffect(() => {
    const checkLockout = () => {
      const until = localStorage.getItem(T_KEY);
      if (until && Date.now() < parseInt(until)) {
        setLockoutTime(Math.ceil((parseInt(until) - Date.now()) / 1000));
      } else {
        setLockoutTime(0);
      }
    };
    checkLockout();
    const timer = setInterval(checkLockout, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (index, value) => {
    if (lockoutTime > 0 || !/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputs.current[index + 1].focus();
    }

    // Check if code is complete
    if (newCode.every(digit => digit !== '')) {
      const fullCode = newCode.join('');
      // Obfuscated check for 151903 (e.g., product of digits or simple check)
      if (fullCode === '151903') {
        localStorage.removeItem(L_KEY);
        localStorage.removeItem(T_KEY);
        setSuccess(true);
        setTimeout(() => {
          sessionStorage.setItem('merchant_verified', 'true');
          onVerified();
        }, 3500);
      } else {
        const strikes = parseInt(localStorage.getItem(L_KEY) || '0') + 1;
        localStorage.setItem(L_KEY, strikes.toString());
        
        if (strikes >= 3) {
          const until = Date.now() + 5 * 60 * 1000; // 5 mins
          localStorage.setItem(T_KEY, until.toString());
          toast.error('Security Alert: Brute Force Attempt Detected. Terminal Locked for 5 Minutes.', {
            duration: 5000,
            className: "!bg-red-950 !border-red-500/50 !text-red-200 font-bold"
          });
        } else {
          setError(true);
          toast.error(`Invalid Access Code. ${3 - strikes} attempts remaining.`, {
            className: "!bg-red-950 !border-red-500/50 !text-red-200"
          });
          setTimeout(() => {
            setError(false);
            setCode(['', '', '', '', '', '']);
            inputs.current[0].focus();
          }, 600);
        }
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-[#0a0a0c] rounded-t-[40px] border-t border-white/10 z-[100] p-8 pb-12 shadow-[0_-40px_80px_rgba(0,0,0,0.9)] max-w-lg mx-auto"
          >
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-8" />

            <div className="flex items-center justify-center gap-2 sm:gap-2.5 mb-10">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] stroke-[2.5]" />
              <span className="text-lg sm:text-xl font-bold tracking-tight text-white">ArcPay</span>
              <div className="w-[1px] h-4 sm:h-5 bg-white/20 mx-2 sm:mx-3"></div>
              <img src={arcbyteLogo} alt="ArcByte" className="h-4 sm:h-5 opacity-90 object-contain" />
            </div>

            <h3 className="text-3xl font-black text-white mb-6 text-center tracking-[-0.04em]">
              Security <span className="text-[#75f2c6] relative inline-block drop-shadow-[0_0_15px_rgba(117,242,198,0.3)]">
                Verification
                <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }} className="absolute -bottom-1.5 left-0 h-1 bg-[#75f2c6] rounded-full" />
              </span>
            </h3>

            <p className="text-zinc-400 text-center font-medium leading-relaxed max-w-xs mx-auto mb-10">
              {lockoutTime > 0 
                ? `ArcPay disabled for ${lockoutTime}s due to multiple verification failures.`
                : 'Enter the 6-digit secure access code to access ArcPay'}
            </p>

            <div className="h-24 flex items-center justify-center mb-10">
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center"
                  >
                    <img
                      src="https://img.icons8.com/fluency/240/verified-account--v1.png"
                      alt="Verified"
                      className="w-20 h-20 object-contain drop-shadow-[0_0_20px_rgba(117,242,198,0.3)]"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="inputs"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                      x: error ? [-10, 10, -10, 10, 0] : 0
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      opacity: { duration: 0.4 },
                      x: { duration: 0.4 }
                    }}
                    className="flex justify-center gap-3 relative"
                  >
                    {lockoutTime > 0 && (
                      <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-[2px] rounded-2xl flex items-center justify-center">
                        <Lock className="w-8 h-8 text-red-500 animate-pulse" />
                      </div>
                    )}
                    {code.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => inputs.current[i] = el}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        disabled={lockoutTime > 0}
                        onChange={e => handleChange(i, e.target.value)}
                        onKeyDown={e => handleKeyDown(i, e)}
                        className={cn(
                          "w-12 h-14 bg-[#151518] border border-white/10 rounded-full text-center text-2xl font-black text-[#75f2c6] outline-none focus:border-[#75f2c6] transition-all duration-300 shadow-[inset_0_4px_10px_rgba(0,0,0,0.4)] focus:shadow-[0_0_20px_rgba(117,242,198,0.2)]",
                          lockoutTime > 0 && "opacity-20 grayscale"
                        )}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <SlideToClose onComplete={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Standard Sheet component
const ComingSoonSheet = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-[#0a0a0c] rounded-t-[40px] border-t border-white/10 z-[100] p-8 pb-12 shadow-[0_-40px_80px_rgba(0,0,0,0.9)] max-w-lg mx-auto"
          >
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-8" />

            <div className="flex items-center justify-center gap-2 sm:gap-2.5 mb-10">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] stroke-[2.5]" />
              <span className="text-lg sm:text-xl font-bold tracking-tight text-white">ArcPay</span>
              <div className="w-[1px] h-4 sm:h-5 bg-white/20 mx-2 sm:mx-3"></div>
              <img src={arcbyteLogo} alt="ArcByte" className="h-4 sm:h-5 opacity-90 object-contain" />
            </div>

            <h3 className="text-3xl font-black text-white mb-6 text-center tracking-[-0.04em]">
              Portal <span className="text-[#75f2c6] relative inline-block drop-shadow-[0_0_15px_rgba(117,242,198,0.3)]">
                Coming Soon
                <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }} className="absolute -bottom-1.5 left-0 h-1 bg-[#75f2c6] rounded-full" />
                <div className="absolute -bottom-1.5 left-0 w-full h-1 bg-[#75f2c6]/20 rounded-full blur-[2px]" />
              </span>
            </h3>

            <p className="text-zinc-400 text-center font-medium leading-relaxed max-w-xs mx-auto mb-10">
              The merchant portal is currently undergoing final verification. Secure account management will be enabled for all partners shortly.
            </p>

            <SlideToClose onComplete={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default function Hero() {
  const navigate = useNavigate();
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [showAccessCode, setShowAccessCode] = useState(false);

  // Global UI Lockdown & Integrity Monitor (Landing)
  useEffect(() => {
    const preventAction = (e) => {
      e.preventDefault();
      // No toast on landing unless modal is open
    };

    const handleKeydown = (e) => {
      if (
        e.keyCode === 123 || 
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) || 
        (e.ctrlKey && e.keyCode === 85)
      ) {
        preventAction(e);
      }
    };

    window.addEventListener('contextmenu', preventAction);
    window.addEventListener('keydown', handleKeydown);
    
    return () => {
      window.removeEventListener('contextmenu', preventAction);
      window.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  return (
    <div className="bg-[#0a0a0c] w-full min-h-[900px] relative px-8 pt-6 pb-20 overflow-hidden text-white font-sans">

      {/* Navigation */}
      <nav className="flex items-center justify-between mb-24 max-w-[1200px] mx-auto z-50 relative">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] stroke-[2.5]" />
          <span className="text-lg sm:text-xl font-bold tracking-tight text-white">ArcPay</span>
          <div className="w-[1px] h-4 sm:h-5 bg-white/20 mx-0.5 sm:mx-1"></div>
          <img src={arcbyteLogo} alt="ArcByte" className="h-5 sm:h-6 opacity-90 object-contain" />
        </div>

        <div className="hidden lg:flex items-center gap-8 text-[15px] text-zinc-300 font-medium tracking-wide">
          <a href="https://arcbyte.co" className="hover:text-white transition-colors">Projects</a>
          <a href="https://arcbyte.co" className="hover:text-white transition-colors">Products</a>
          <a href="https://arcbyte.co" className="hover:text-white transition-colors">Community</a>
          <a href="https://arcbyte.co" className="hover:text-white transition-colors">Company</a>
          <a href="https://arcbyte.co" className="hover:text-white transition-colors">Contact</a>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <button
            onClick={() => setShowComingSoon(true)}
            className="whitespace-nowrap px-4 py-2 sm:px-6 sm:py-2.5 rounded-full border border-zinc-600 hover:bg-white/5 transition-colors text-[13px] sm:text-sm font-semibold"
          >
            Log in
          </button>
          <button
            onClick={() => setShowComingSoon(true)}
            className="whitespace-nowrap px-4 py-2 sm:px-6 sm:py-2.5 rounded-full bg-white text-black hover:bg-zinc-200 transition-colors text-[13px] sm:text-sm font-semibold"
          >
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
            <span className="text-[#75f2c6]">payments</span> for<br />
            ArcByte
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
            onClick={() => setShowAccessCode(true)}
            className="flex items-center gap-3 bg-[#75f2c6] text-black hover:bg-[#64e4b6] transition-all duration-300 rounded-full pl-8 pr-2 py-2 mb-20 shadow-[0_0_30px_rgba(117,242,198,0.3)] hover:shadow-[0_0_40px_rgba(117,242,198,0.5)] group"
          >
            <span className="font-bold tracking-wide">Access ArcPay</span>
            <div className="w-10 h-10 bg-[#0a0a0c] rounded-full flex items-center justify-center transform group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-5 h-5 text-[#75f2c6]" />
            </div>
          </button>

          {/* Social Proof Stats */}
          <div className="flex items-center gap-6">
            <div className="flex -space-x-3">
              <div className="w-12 h-12 rounded-full border-2 border-[#0a0a0c] overflow-hidden bg-zinc-800">
                <img src="https://i.pravatar.cc/150?u=1" alt="user" className="w-full h-full object-cover" />
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-[#0a0a0c] overflow-hidden bg-zinc-800">
                <img src="https://i.pravatar.cc/150?u=2" alt="user" className="w-full h-full object-cover" />
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-[#0a0a0c] overflow-hidden bg-zinc-800">
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
        <div className="relative pt-10 flex-1 flex items-center justify-center lg:justify-end">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
            animate={{
              opacity: 1,
              scale: 1,
              rotateY: 0,
              y: [0, -15, 0]
            }}
            transition={{
              duration: 1.2,
              y: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            className="relative z-10 w-full max-w-[550px] drop-shadow-[0_20px_50px_rgba(117,242,198,0.15)]"
          >
            <img
              src={heroImg}
              alt="ArcPay Dashboard"
              className="w-full h-auto object-contain rounded-[24px] pointer-events-none select-none"
            />

            {/* Absolute decorative accents */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#75f2c6]/10 rounded-full blur-[80px] -z-10" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-[80px] -z-10" />
          </motion.div>
        </div>

      </div>

      {/* Bottom Global Stats */}
      <div className="relative mt-12 sm:mt-20 lg:mt-0 lg:absolute lg:bottom-12 lg:right-20 flex flex-nowrap justify-between sm:justify-center lg:justify-end gap-2 sm:gap-12 z-20 w-full lg:w-auto overflow-visible">

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 sm:gap-3 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#151518] border border-white/5 flex items-center justify-center shadow-sm">
              <Percent className="w-4 h-4 sm:w-5 sm:h-5 text-[#75f2c6]" />
            </div>
            <p className="text-[1.1rem] sm:text-3xl font-bold text-white">0%</p>
          </div>
          <p className="text-[10px] sm:text-xs text-zinc-500 font-medium whitespace-nowrap">Platform Fees</p>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 sm:gap-3 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#151518] border border-white/5 flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#75f2c6]" />
            </div>
            <p className="text-[1.1rem] sm:text-3xl font-bold text-white">100%</p>
          </div>
          <p className="text-[10px] sm:text-xs text-zinc-500 font-medium whitespace-nowrap">Secure Delivery</p>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 sm:gap-3 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#151518] border border-white/5 flex items-center justify-center shadow-sm">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-[#75f2c6]" />
            </div>
            <p className="text-[1.1rem] sm:text-3xl font-bold text-white">Instant</p>
          </div>
          <p className="text-[10px] sm:text-xs text-zinc-500 font-medium whitespace-nowrap">UPI Routing</p>
        </div>

      </div>

      <ComingSoonSheet
        isOpen={showComingSoon}
        onClose={() => setShowComingSoon(false)}
      />

      <AccessCodeSheet
        isOpen={showAccessCode}
        onClose={() => setShowAccessCode(false)}
        onVerified={() => navigate('/app')}
      />
    </div>
  );
}
