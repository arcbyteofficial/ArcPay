import { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, ArrowRight, Check, Smartphone, QrCode, Settings, ChevronLeft, Wallet, Download, ShieldCheck } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import arcbyteLogo from '../assets/arcbyte.co Logo_white_transparent.png';
import paytmLogo from '../assets/paytm.png';
import upiLogo from '../assets/upi.png';
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const PAYEE_VPA = 'aidan.rodrigues@superyes';
const PAYEE_NAME = 'Aidan Rodrigues';
const CharacterFade = ({ text, x, maxDistance = 120, disabled }) => {
  const characters = text.split('');
  // We want the fade to be staggered. 
  // Each letter starts fading at a different point in the drag.
  return (
    <div className="flex">
      {characters.map((char, i) => {
        // Calculate the individual character's fade range
        // Stagger them so they disappear one by one
        const charStep = maxDistance / characters.length;
        const start = i * charStep;
        const end = start + Math.min(charStep * 3, 40); // Overlap for smooth transition
        
        // Use the hook inside the map's child component or calculate manually
        // Since we can't call hooks in a loop, we use a sub-component
        return (
          <CharacterSpan 
            key={i} 
            char={char} 
            x={x} 
            range={[start, end]} 
            disabled={disabled} 
          />
        );
      })}
    </div>
  );
};

const CharacterSpan = ({ char, x, range, disabled }) => {
  const opacity = useTransform(x, range, [1, 0]);
  return (
    <motion.span 
      style={{ opacity: disabled ? 1 : opacity }} 
      className="inline-block whitespace-pre"
    >
      {char}
    </motion.span>
  );
};

const SlideToCancel = ({ onComplete }) => {
  const containerRef = useRef(null);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [0, 64], [1, 0]);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-sm mx-auto h-[64px] bg-[#0a0a0c] rounded-full overflow-hidden flex items-center border border-white/5 shadow-[inset_0_4px_10px_rgba(0,0,0,0.4)] mt-12"
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center pl-10 pointer-events-none">
        <span className="text-zinc-500 font-bold tracking-[0.2em] text-xs">
          <CharacterFade text="SLIDE TO CANCEL" x={x} />
        </span>
      </div>

      <motion.div
        drag="x"
        style={{ x }}
        dragConstraints={{ left: 0, right: 280 }} // Safety constraints
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
        <ArrowLeft className="w-5 h-5 text-white/50" />
      </motion.div>
    </div>
  );
};

const AppChooser = ({ isOpen, onClose, upiParams }) => {
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
            className="fixed bottom-0 left-0 right-0 bg-[#0a0a0c] rounded-t-[40px] border-t border-white/10 z-[100] p-8 pb-12 shadow-[0_-40px_80px_rgba(0,0,0,0.9)]"
          >
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-8" />

            <div className="flex items-center justify-center gap-2 sm:gap-2.5 mb-10">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] stroke-[2.5]" />
              <span className="text-lg sm:text-xl font-bold tracking-tight text-white">ArcPay</span>
              <div className="w-[1px] h-4 sm:h-5 bg-white/20 mx-2 sm:mx-3"></div>
              <img src={arcbyteLogo} alt="ArcByte" className="h-4 sm:h-5 opacity-90 object-contain" />
            </div>

            <h3 className="text-3xl font-black text-white mb-10 text-center tracking-[-0.04em]">
              Select <span className="text-[#75f2c6] relative inline-block drop-shadow-[0_0_15px_rgba(117,242,198,0.3)]">
                Payment
                <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }} className="absolute -bottom-1.5 left-0 h-1 bg-[#75f2c6] rounded-full" />
                <div className="absolute -bottom-1.5 left-0 w-full h-1 bg-[#75f2c6]/20 rounded-full blur-[2px]" />
              </span> App
            </h3>

            <div className="grid grid-cols-4 gap-4 max-w-sm mx-auto">
              {[
                { name: 'GPay', id: 'gpay', prefix: 'tez://upi/pay?', iconUrl: 'https://img.icons8.com/color/512/google-pay.png' },
                { name: 'PhonePe', id: 'phonepe', prefix: 'phonepe://pay?', iconUrl: 'https://img.icons8.com/color/512/phone-pe.png' },
                { name: 'Paytm', id: 'paytm', prefix: 'paytmmp://pay?', iconUrl: paytmLogo },
                { name: 'Other', id: 'other', prefix: 'upi://pay?', iconUrl: upiLogo }
              ].map(app => (
                <a
                  key={app.id}
                  href={`${app.prefix}${upiParams}`}
                  onClick={(e) => {
                    e.preventDefault();
                    // Manually trigger the intent to ensure OS catches it
                    window.location.href = `${app.prefix}${upiParams}`;
                    // Defer unmounting the modal so it doesn't kill the event
                    setTimeout(() => {
                      onClose();
                    }, 150);
                  }}
                  className="flex flex-col items-center gap-3 group"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[22px] flex items-center justify-center relative overflow-hidden drop-shadow-xl hover:drop-shadow-2xl group-hover:-translate-y-1 transition-all duration-300">
                    {app.iconUrl ? (
                      <img src={app.iconUrl} alt={app.name} className="w-full h-full object-contain z-10 transition-transform group-hover:scale-105" />
                    ) : app.id === 'other' ? (
                      <Smartphone className="w-6 h-6 sm:w-7 sm:h-7" />
                    ) : (
                      app.name.charAt(0)
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500 group-hover:text-white tracking-[0.1em] uppercase mt-1 transition-colors">{app.name}</span>
                </a>
              ))}
            </div>

            <SlideToCancel onComplete={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const SlideToPay = ({ onComplete }) => {
  const containerRef = useRef(null);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [0, 64], [1, 0]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[64px] bg-[#151518] rounded-full overflow-hidden flex items-center border border-white/10 shadow-[inset_0_4px_10px_rgba(0,0,0,0.5)] mt-8"
    >
      {/* Track text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pl-10 pointer-events-none">
        <span className="text-zinc-500 font-bold tracking-[0.2em] text-xs">
          <CharacterFade text="SLIDE TO PAY SECURELY" x={x} />
        </span>
      </div>

      {/* Draggable thumb */}
      <motion.div
        drag="x"
        style={{ x }}
        dragConstraints={{ left: 0, right: 300 }}
        dragElastic={0.05}
        dragSnapToOrigin={true}
        onDragEnd={(e, info) => {
          if (containerRef.current) {
            const trackWidth = containerRef.current.offsetWidth;
            // Activate if dragged past 70%
            if (info.offset.x > trackWidth * 0.7) {
              onComplete();
            }
          }
        }}
        className="absolute left-1.5 top-1.5 bottom-1.5 w-[52px] bg-white rounded-full flex items-center justify-center z-10 cursor-grab active:cursor-grabbing shadow-[0_0_15px_rgba(255,255,255,0.4)]"
      >
        <ShieldCheck className="w-5 h-5 text-black" />
      </motion.div>
    </div>
  );
};

const SlideToGenerate = ({ onComplete, disabled }) => {
  const containerRef = useRef(null);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [0, 64], [1, 0]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-[64px] bg-[#75f2c6] rounded-full overflow-hidden flex items-center shadow-[0_0_30px_rgba(117,242,198,0.3)] mt-8 transition-all",
        disabled && "opacity-50 grayscale cursor-not-allowed"
      )}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center pl-8 pointer-events-none select-none">
        <span className="text-black font-bold tracking-wide">
          <CharacterFade 
            text={disabled ? "Generate Link" : "Slide to Generate"} 
            x={x} 
            disabled={disabled}
          />
        </span>
      </div>

      <motion.div
        drag={disabled ? false : "x"}
        style={{ x }}
        whileHover={!disabled ? { scale: 1.05 } : {}}
        dragConstraints={{ left: 0, right: 300 }}
        dragElastic={0.05}
        dragSnapToOrigin={true}
        onDragEnd={(e, info) => {
          if (!disabled && containerRef.current) {
            const trackWidth = containerRef.current.offsetWidth;
            if (info.offset.x > trackWidth * 0.65) {
              onComplete();
            }
          }
        }}
        className={cn(
          "absolute left-2 top-2 bottom-2 w-[48px] bg-[#0a0a0c] rounded-full flex items-center justify-center z-10",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-grab active:cursor-grabbing shadow-[0_0_15px_rgba(10,10,12,0.5)]"
        )}
      >
        <ArrowRight className="w-5 h-5 text-[#75f2c6] stroke-[3px]" />
      </motion.div>
    </div>
  );
};

const SlideToCopy = ({ onComplete }) => {
  const containerRef = useRef(null);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [0, 64], [1, 0]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-[64px] bg-[#75f2c6] rounded-full overflow-hidden flex items-center shadow-[0_0_30px_rgba(117,242,198,0.3)] mt-8"
      )}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center pl-8 pointer-events-none select-none">
        <span className="text-black font-bold tracking-wide">
          <CharacterFade text="Slide to Copy Link" x={x} />
        </span>
      </div>

      <motion.div
        drag="x"
        style={{ x }}
        whileHover={{ scale: 1.05 }}
        dragConstraints={{ left: 0, right: 300 }}
        dragElastic={0.05}
        dragSnapToOrigin={true}
        onDragEnd={(e, info) => {
          if (containerRef.current) {
            const trackWidth = containerRef.current.offsetWidth;
            if (info.offset.x > trackWidth * 0.65) {
              onComplete();
            }
          }
        }}
        className="absolute left-2 top-2 bottom-2 w-[48px] bg-[#0a0a0c] rounded-full flex items-center justify-center z-10 cursor-grab active:cursor-grabbing shadow-[0_0_15px_rgba(10,10,12,0.5)]"
      >
        <ArrowRight className="w-5 h-5 text-[#75f2c6] stroke-[3px]" />
      </motion.div>
    </div>
  );
};

const LinkGeneratedSheet = ({ isOpen, onClose, link }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard!');
    // Auto-close after a small delay for feedback
    setTimeout(() => {
      onClose();
    }, 400); 
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
            className="fixed bottom-0 left-0 right-0 bg-[#0a0a0c] rounded-t-[40px] border-t border-white/10 z-[100] p-8 pb-12 shadow-[0_-40px_80px_rgba(0,0,0,0.9)]"
          >
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-8" />

            <div className="flex items-center justify-center gap-2 sm:gap-2.5 mb-10">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] stroke-[2.5]" />
              <span className="text-lg sm:text-xl font-bold tracking-tight text-white">ArcPay</span>
              <div className="w-[1px] h-4 sm:h-5 bg-white/20 mx-2 sm:mx-3"></div>
              <img src={arcbyteLogo} alt="ArcByte" className="h-4 sm:h-5 opacity-90 object-contain" />
            </div>

            <h3 className="text-3xl font-black text-white mb-6 text-center tracking-[-0.04em]">
              Link <span className="text-[#75f2c6] relative inline-block drop-shadow-[0_0_15px_rgba(117,242,198,0.3)]">
                Generated
                <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }} className="absolute -bottom-1.5 left-0 h-1 bg-[#75f2c6] rounded-full" />
                <div className="absolute -bottom-1.5 left-0 w-full h-1 bg-[#75f2c6]/20 rounded-full blur-[2px]" />
              </span>
            </h3>

            <div className="w-full bg-[#151518] border border-white/5 rounded-2xl p-4 mb-8 flex items-center justify-between overflow-hidden">
               <p className="text-zinc-400 text-sm truncate font-medium flex-1 mr-4">{link}</p>
               <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                 <QrCode className="w-4 h-4 text-[#75f2c6]" />
               </div>
            </div>

            <div className="">
              <SlideToCopy onComplete={handleCopy} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default function Dashboard() {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [name, setName] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [showAppChooser, setShowAppChooser] = useState(false);
  const [showSuccessSheet, setShowSuccessSheet] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const payId = searchParams.get('pay_id');

    if (payId) {
      try {
        const decoded = JSON.parse(atob(payId));
        if (decoded.a) setAmount(decoded.a);
        if (decoded.n) setNote(decoded.n);
        if (decoded.nm) setName(decoded.nm);
        setIsLocked(true);
      } catch (e) {
        console.error("Invalid payment link", e);
      }
    }
  }, []);

  const generateUPIParams = () => {
    const finalNote = name.trim() ? `${name.trim()} - ${note.trim()}` : note.trim();
    const encodedNote = encodeURIComponent(finalNote);
    const validAmount = amount && !isNaN(Number(amount)) && Number(amount) > 0 ? Number(amount).toFixed(2) : '';

    if (!validAmount) return '';
    return `pa=${PAYEE_VPA}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${validAmount}&cu=INR${encodedNote ? `&tn=${encodedNote}` : ''}`;
  };

  const generateUPIURI = () => {
    const params = generateUPIParams();
    return params ? `upi://pay?${params}` : '';
  };

  const upiURI = generateUPIURI();
  const upiParams = generateUPIParams();
  const isValid = Boolean(upiURI);

  const handlePrimaryAction = () => {
    if (!isValid) return;

    if (isLocked) {
      setShowAppChooser(true);
    } else {
      const payload = btoa(JSON.stringify({ a: amount, n: note, nm: name }));
      const baseUrl = window.location.origin + window.location.pathname;
      const shareableUrl = `${baseUrl}?pay_id=${payload}`;
      
      setGeneratedLink(shareableUrl);
      navigator.clipboard.writeText(shareableUrl);

      // Mobile Success Sheet vs Desktop Toast
      if (window.innerWidth < 1024) {
        setShowSuccessSheet(true);
      } else {
        toast('Your unique payment link is copied!', {
          icon: (
            <div className="w-[22px] h-[22px] bg-[white] rounded-full flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5 text-black" strokeWidth={3.5} />
            </div>
          ),
          className: "!bg-[#050505] !border !border-white/[0.08] !text-white font-bold text-[14px] !rounded-[12px] !shadow-[0_10px_40px_rgba(0,0,0,0.8)] !gap-3 !p-4"
        });
      }
    }
  };

  const qrRef = useRef(null);

  const handleDownloadQR = () => {
    if (!isValid) return;
    const svg = qrRef.current;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      const padding = 40;
      canvas.width = img.width + padding * 2;
      canvas.height = img.height + padding * 2;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, padding, padding);

      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `ArcPay_QR_${amount}INR.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="min-h-screen bg-black p-0 sm:p-4 md:p-6 lg:p-8 font-sans antialiased text-white selection:bg-teal-500/30">
      <Toaster theme="dark" position="top-center" />
      <div className="max-w-[1400px] mx-auto rounded-none sm:rounded-[40px] overflow-hidden shadow-2xl relative min-h-screen sm:min-h-[90vh] bg-[#0a0a0c] px-4 sm:px-8 pt-6 pb-20">
        {/* Navigation - Identical to Hero.jsx */}
        <nav className="flex items-center justify-between mb-16 max-w-[1200px] mx-auto z-50 relative">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] stroke-[2.5]" />
            <span className="text-lg sm:text-xl font-bold tracking-tight text-white">ArcPay</span>
            <div className="w-[1px] h-4 sm:h-5 bg-white/20 mx-0.5 sm:mx-1"></div>
            <img src={arcbyteLogo} alt="ArcByte" className="h-5 sm:h-6 opacity-90 object-contain" />
          </div>


          <div className="flex items-center gap-4">
            {isLocked ? (
              <button
                onClick={() => {
                  window.history.replaceState({}, '', window.location.pathname);
                  setIsLocked(false);
                  setAmount(''); setNote(''); setName('');
                }}
                className="px-6 py-2.5 rounded-full border border-zinc-600 hover:bg-white/5 transition-colors text-sm font-semibold flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Create New
              </button>
            ) : (
              <button
                onClick={() => {
                  window.location.href = '/';
                }}
                className="px-6 py-2.5 rounded-full border border-zinc-600 hover:bg-white/5 transition-colors text-sm font-semibold flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Home
              </button>
            )}
          </div>
        </nav>

        {/* Abstract Top squiggly right */}
        <div className="absolute top-20 right-20 opacity-30 pointer-events-none">
          <svg width="150" height="150" viewBox="0 0 120 80" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round">
            <path d="M10 70 C 20 20, 60 100, 80 40 C 90 10, 110 30, 115 20 M 80 40 C 90 80, 50 10, 30 50" />
          </svg>
        </div>

        <div className="max-w-[1200px] mx-auto relative z-10">
          {isLocked ? (
            /* ========================================= */
            /* PAYER MODE: Mockup Mobile App Style 1:1   */
            /* ========================================= */
            <div className="flex flex-col lg:flex-row items-center justify-center gap-20">
              {/* Left Typography Block */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="flex flex-col z-10 w-full lg:w-1/2">
                <h2 className="text-5xl font-black text-white tracking-[-0.04em] leading-[1.1] mb-6">
                  Complete your<br />
                  <span className="text-[#75f2c6]">Secure</span><br />
                  Payment
                </h2>
                <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-[280px] mb-8">
                  Scan the verification code directly or click standard approval to open your system's native banking application.
                </p>

                {name && (
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 border-[3px] border-[#0a0a0c] shadow-lg flex items-center justify-center text-xl font-black text-white">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wide">Requesting User</p>
                      <p className="text-white font-bold">{name}</p>
                    </div>
                  </div>
                )}

                {note && (
                  <div className="mt-4 p-4 px-6 rounded-full bg-[#151518] border border-white/10 max-w-sm">
                    <p className="text-zinc-400 text-sm italic">"{note}"</p>
                  </div>
                )}

                {/* NEW MOBILE CHECKOUT BLOCK (Hidden on LG and above) */}
                <div className="lg:hidden mt-12 w-full max-w-sm mx-auto sm:mx-0">
                  <div className="w-full bg-[#151518] rounded-[32px] p-8 shadow-[0_0_40px_rgba(117,242,198,0.15)] border border-[#75f2c6]/20 relative overflow-hidden block mb-6">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#75f2c6] rounded-full opacity-[0.15] blur-[40px] pointer-events-none"></div>
                    <div className="flex justify-between flex-col relative z-20">
                      <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest block mb-1">Paying Amount</span>
                      <div className="flex items-baseline gap-1.5 mt-2">
                        <span className="text-[#75f2c6]/60 text-4xl">₹</span>
                        <span className="text-[#75f2c6] font-bold text-6xl tracking-tighter drop-shadow-[0_0_15px_rgba(117,242,198,0.3)]">{amount || "0.00"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Slide to Pay Button */}
                  <SlideToPay onComplete={handlePrimaryAction} />
                </div>
              </motion.div>

              {/* Center Mobile Mockup - Redesigned to Dark Theme */}
              <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1, delay: 0.2 }} className="hidden lg:flex justify-center z-10 relative mt-10 lg:mt-0">
                <div className="w-[320px] bg-[#0a0a0c] rounded-[40px] shadow-[0_40px_80px_rgba(0,0,0,0.8)] p-4 relative border-[12px] border-[#1c1c20]">

                  {/* Phone header */}
                  <div className="flex items-center justify-between px-2 pt-2 mb-6">
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
                      <ChevronLeft className="w-4 h-4 text-zinc-300" />
                    </div>
                    <span className="font-bold text-white tracking-tight">Checkout</span>
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
                      <Settings className="w-4 h-4 text-zinc-300" />
                    </div>
                  </div>

                  {/* Simulated App Card (Blue Gradient) */}
                  <div className="w-full rounded-[24px] p-6 relative overflow-hidden shadow-2xl mb-8 border border-white/5"
                    style={{ background: 'linear-gradient(to right bottom, #0088ff 0%, #0044ff 40%, #151515 90%)' }}>
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-cyan-400/30 to-transparent opacity-80 mix-blend-screen"></div>
                    <div className="absolute top-6 right-6 text-white font-black text-xl tracking-widest drop-shadow-md opacity-90">UPI</div>

                    <div className="mt-4 mb-8">
                      <div className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Paying Amount</div>
                      <div className="font-bold text-3xl tracking-tight text-white drop-shadow-md">
                        {'\u20B9'}{amount}
                      </div>
                    </div>

                    <div className="flex gap-12 text-[10px] text-zinc-300 font-semibold uppercase">
                      <div className="flex flex-col">
                        <span className="mb-1 opacity-70">Target</span>
                        <span className="text-white text-xs">{PAYEE_NAME}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Box */}
                  <div className="px-2 pb-4">
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-4 text-center">Scan to Pay</p>

                    <div className="w-full flex justify-center mb-6">
                      <div className="p-4 rounded-3xl bg-white shadow-[0_0_40px_rgba(255,255,255,0.05)] border border-white/10">
                        <QRCodeSVG
                          value={upiURI}
                          size={160}
                          level={"Q"}
                          includeMargin={false}
                          className="rounded-xl"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handlePrimaryAction}
                      className="w-full bg-[#75f2c6] hover:bg-[#64e4b6] text-black py-4 rounded-[20px] text-[15px] font-bold tracking-wide flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(117,242,198,0.2)] hover:-translate-y-1 transition-all group border border-[#75f2c6]/50"
                    >
                      <Smartphone className="w-5 h-5 group-hover:scale-110 transition-transform text-black" /> Open Bank App
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>

          ) : (

            /* ========================================= */
            /* CREATOR MODE: Dashboard Editor Setup      */
            /* ========================================= */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start pt-10">

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} className="flex flex-col">
                <h1 className="text-5xl sm:text-6xl font-black leading-[1.05] tracking-[-0.03em] mb-6 drop-shadow-sm text-white">
                  Configure Payment<br />
                  <span className="text-[#75f2c6]">Specifications</span><br />
                </h1>
                <p className="text-zinc-400 text-lg max-w-[420px] mb-12 font-medium leading-relaxed">
                  Specify exact transaction parameters to facilitate a professional and highly-verified settlement process.
                </p>

                {/* Form Fields Styled with pill shapes from Hero/Showcase */}
                <div className="space-y-6 max-w-md">
                  <div>
                    <p className="text-sm font-semibold tracking-wide text-zinc-300 mb-3 px-2">Amount (₹)</p>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setAmount('');
                          return;
                        }
                        const num = Number(val);
                        if (!isNaN(num) && num <= 100000) {
                          setAmount(val);
                        }
                      }}
                      placeholder="0.00"
                      className="w-full bg-[#151518] focus:bg-[#1a1a1e] border border-white/[0.05] focus:border-[#75f2c6] px-6 py-4 rounded-full outline-none text-white font-medium text-lg transition-colors placeholder:text-zinc-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold tracking-wide text-zinc-300 mb-3 px-2 flex justify-between">
                      <span>Client Name</span> <span className="text-zinc-600 text-xs align-bottom">Optional</span>
                    </p>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Zahra Mohamadi"
                      className="w-full bg-[#151518] focus:bg-[#1a1a1e] border border-white/[0.05] focus:border-zinc-500 px-6 py-4 rounded-full outline-none text-white font-medium transition-colors placeholder:text-zinc-600"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold tracking-wide text-zinc-300 mb-3 px-2 flex justify-between">
                      <span>Target Goal</span> <span className="text-zinc-600 text-xs align-bottom">Optional</span>
                    </p>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Design Consultation..."
                      className="w-full bg-[#151518] focus:bg-[#1a1a1e] border border-white/[0.05] focus:border-zinc-500 px-6 py-4 rounded-full outline-none text-white font-medium transition-colors placeholder:text-zinc-600"
                    />
                  </div>

                  <SlideToGenerate
                    onComplete={handlePrimaryAction}
                    disabled={!isValid}
                  />
                </div>
              </motion.div>

              {/* Right Side: Virtual Preview holographic card */}
              <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1, delay: 0.2 }} className="relative h-[600px] hidden lg:block">
                <div className="absolute top-20 right-0 w-[420px] h-[480px] rounded-[40px] shadow-2xl overflow-hidden backdrop-blur-3xl border border-white/5 z-20 flex flex-col p-10 bg-[#151518]">
                  <div className="flex justify-between items-start w-full mb-12">
                    <div className="text-white font-semibold text-lg tracking-tight">Invoice Details</div>
                    <Wallet className="w-6 h-6 text-[#75f2c6]" />
                  </div>

                  <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">To Receiver</div>
                  <div className="text-white font-bold text-2xl tracking-tight mb-8 truncate">{name || "Anonymous Client"}</div>

                  <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">Requesting</div>
                  <div className="text-[#75f2c6] font-black text-5xl tracking-tighter mb-10 drop-shadow-[0_0_15px_rgba(117,242,198,0.2)]">
                    <span className="text-[#75f2c6]/60 text-3xl mr-1">₹</span>{amount || "0.00"}
                  </div>

                  <div className="mt-auto pt-6 border-t border-white/10 flex justify-between items-center">
                    <div>
                      <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-1">Status</div>
                      <div className="flex items-center gap-2 text-[#75f2c6] font-semibold text-sm">
                        <div className="w-2 h-2 rounded-full bg-[#75f2c6] animate-pulse"></div> Active
                      </div>
                    </div>

                    <button onClick={handleDownloadQR} disabled={!isValid} className={cn("p-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white", !isValid && "opacity-50")}>
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Floating aesthetic background card */}
                <div
                  className="absolute top-6 left-10 w-[380px] h-[420px] rounded-[40px] overflow-hidden shadow-2xl backdrop-blur-xl border border-white/20 z-10"
                  style={{
                    transform: 'perspective(1000px) rotateX(15deg) rotateY(-10deg) rotateZ(-5deg)',
                    background: 'linear-gradient(135deg, rgba(230,230,250,0.8) 0%, rgba(135,206,235,0.8) 40%, rgba(255,105,180,0.6) 100%)'
                  }}
                >
                  <div className="absolute inset-0 bg-black/40 mix-blend-overlay"></div>
                </div>
              </motion.div>

            </div>
          )}
        </div>

        <AppChooser isOpen={showAppChooser} onClose={() => setShowAppChooser(false)} upiParams={upiParams} />
        <LinkGeneratedSheet isOpen={showSuccessSheet} onClose={() => setShowSuccessSheet(false)} link={generatedLink} />
      </div>
    </div>
  );
}
