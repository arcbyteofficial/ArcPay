import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, ArrowRight, Check, Smartphone, QrCode, Settings, ChevronLeft, Wallet, Download, ShieldCheck, FileText, Lock, HelpCircle } from 'lucide-react';
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
import SEO from '../components/common/SEO';

const PAYEE_VPA = 'aidan.rodrigues@superyes';
const PAYEE_NAME = 'Aidan Rodrigues';

// Robust generic copy function
const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.error('Clipboard API failed, using fallback', err);
  }

  // Fallback for older browsers or non-secure contexts
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback copy failed', err);
    return false;
  }
};
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

  useEffect(() => {
    const interval = setInterval(() => {
      if (x.get() === 0) {
        animate(x, 12, {
          duration: 0.5,
          ease: "easeInOut",
          onComplete: () => {
            setTimeout(() => {
              if (x.get() === 12) animate(x, 0, { duration: 0.5, ease: "easeInOut" });
            }, 200);
          }
        });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [x]);

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

            <div className="flex items-center justify-center gap-3 mt-8 opacity-40 group">
              <img src={arcbyteLogo} alt="ArcByte" className="h-2.5 object-contain grayscale brightness-200" />
              <p className="text-[9px] text-white/80 leading-relaxed font-medium tracking-tight">
                PROTOCOL NOTICE: Money will be debited from your linked bank account after proceeding with your selected application. ArcPay is a technology interface.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

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
              Support <span className="text-[#75f2c6] relative inline-block drop-shadow-[0_0_15px_rgba(117,242,198,0.3)]">
                Coming Soon
                <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }} className="absolute -bottom-1.5 left-0 h-1 bg-[#75f2c6] rounded-full" />
                <div className="absolute -bottom-1.5 left-0 w-full h-1 bg-[#75f2c6]/20 rounded-full blur-[2px]" />
              </span>
            </h3>

            <p className="text-zinc-400 text-center font-medium leading-relaxed max-w-xs mx-auto mb-10">
              Personalized merchant support and live chat features are currently under development. Please reach out via our official portal for immediate assistance.
            </p>

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
        animate={{ x: [0, 8, 0] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 1
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
        animate={!disabled ? { x: [0, 8, 0] } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 1
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
        animate={{ x: [0, 8, 0] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 1
        }}
        className="absolute left-2 top-2 bottom-2 w-[48px] bg-[#0a0a0c] rounded-full flex items-center justify-center z-10 cursor-grab active:cursor-grabbing shadow-[0_0_15px_rgba(10,10,12,0.5)]"
      >
        <ArrowRight className="w-5 h-5 text-[#75f2c6] stroke-[3px]" />
      </motion.div>
    </div>
  );
};

const LinkGeneratedSheet = ({ isOpen, onClose, link }) => {
  const handleCopy = async () => {
    const success = await copyToClipboard(link);
    if (success) {
      toast.success('Link copied to clipboard!');
    } else {
      toast.error('Failed to copy. Please copy manually.');
    }

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
  const navigate = useNavigate();
  const location = useLocation();
  const [amount, setAmount] = useState('');

  // Security Layer: Protect merchant configuration terminal
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const payId = searchParams.get('pay_id');
    const isVerified = sessionStorage.getItem('merchant_verified') === 'true';

    // Redirect iff NOT on a shared payment link AND NOT verified
    if (!payId && !isVerified) {
      navigate('/', { replace: true });
    }
  }, [location.search, navigate]);

  const [note, setNote] = useState('');
  const [name, setName] = useState('Aidan Rodrigues');
  const [payerName, setPayerName] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [showAppChooser, setShowAppChooser] = useState(false);
  const [showSuccessSheet, setShowSuccessSheet] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  // Immediate block to prevent UI flash before redirect
  const searchParams = new URLSearchParams(location.search);
  const hasPayId = searchParams.has('pay_id');
  const sessionVerified = sessionStorage.getItem('merchant_verified') === 'true';

  if (!hasPayId && !sessionVerified) {
    return null; // Don't render anything if merchant isn't verified
  }

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const payId = searchParams.get('pay_id');

    if (payId) {
      try {
        const decoded = JSON.parse(atob(payId));
        if (decoded.a) setAmount(decoded.a);
        if (decoded.n) setNote(decoded.n);
        if (decoded.nm) setName(decoded.nm);
        if (decoded.p) setPayerName(decoded.p);
        if (decoded.iid) setInvoiceId(decoded.iid);
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
  const isValid = Boolean(upiURI) && note.trim() !== '' && name.trim() !== '' && payerName.trim() !== '';

  const handlePrimaryAction = () => {
    if (!isValid) return;

    if (isLocked) {
      setShowAppChooser(true);
    } else {
      const newInvoiceId = `AP-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setInvoiceId(newInvoiceId);

      const payload = btoa(JSON.stringify({ a: amount, n: note, nm: name, p: payerName, iid: newInvoiceId }));
      const baseUrl = window.location.origin + window.location.pathname;
      const shareableUrl = `${baseUrl}?pay_id=${payload}`;

      setGeneratedLink(shareableUrl);
      copyToClipboard(shareableUrl);

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
    <div className="min-h-screen bg-black p-0 sm:p-4 md:p-6 lg:p-8 font-sans antialiased text-white selection:bg-[#75f2c6]/30">
      <SEO
        title={isLocked ? `Pay ₹${amount} to ${name || PAYEE_NAME}` : "Create Professional Payment Link"}
        description={isLocked ? `Securely complete your payment of ₹${amount} to ${name || PAYEE_NAME} via ArcPay instant UPI settlement.` : undefined}
      />
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
                onClick={() => setShowHelp(true)}
                className="px-6 py-2.5 rounded-full border border-zinc-600 hover:bg-white/5 transition-colors text-sm font-semibold flex items-center gap-2"
              >
                <HelpCircle className="w-4 h-4" /> Help
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    sessionStorage.removeItem('merchant_verified');
                    window.location.href = '/';
                  }}
                  className="px-4 py-2.5 rounded-full border border-zinc-600 hover:bg-white/5 transition-colors text-sm font-semibold flex items-center gap-2"
                  title="Lock Terminal"
                >
                  <Lock className="w-4 h-4 text-white" />
                  <span className="hidden sm:inline">Lock</span>
                </button>
                <button
                  onClick={() => {
                    window.location.href = '/';
                  }}
                  className="px-6 py-2.5 rounded-full border border-zinc-600 hover:bg-white/5 transition-colors text-sm font-semibold flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Home
                </button>
              </div>
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
                  <span className="text-[#75f2c6]">Payment</span><br />
                  Securely
                </h2>
                <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-[280px] mb-8">
                  Verify the transaction parameters below. Utilize the verification cipher or select standard authorization to initiate settlement via your service provider's native interface.
                </p>

                {name && (
                  <div className="flex flex-col gap-5 mb-8">
                    <div className="flex items-center gap-5">
                      <img src={arcbyteLogo} alt="ArcByte" className="h-6 opacity-100 object-contain shrink-0" />
                      <div>
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Requesting User</p>
                        <p className="text-white text-lg font-bold tracking-tight">{name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-5">
                      <ShieldCheck className="w-6 h-6 text-[#75f2c6]" />
                      <div>
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Payer Name</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-[#75f2c6] text-lg font-black tracking-tight">{payerName || "Valued Payer"}</p>
                          <span className="text-white/20 text-[10px] font-mono tracking-widest">{invoiceId || "#AP-XXXX"}</span>
                        </div>
                      </div>
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
                  <div className="w-full bg-[#08080a] rounded-[32px] p-8 shadow-[0_0_40px_rgba(117,242,198,0.1)] border border-white/[0.03] relative overflow-hidden block mb-6">
                    <div className="flex justify-between flex-col relative z-20">
                      <div className="flex items-center gap-2 mb-8 opacity-40">
                        <ShieldCheck className="w-3.5 h-3.5 text-white" />
                        <span className="text-[12px] font-black text-white tracking-tight">ArcPay</span>
                        <div className="w-[0.5px] h-3 shadow-[0.5px_0_0_rgba(255,255,255,0.3)] mx-1"></div>
                        <img src={arcbyteLogo} alt="ArcByte" className="h-3.5 opacity-100 object-contain" />
                      </div>
                      <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest block mb-1">Paying Amount</span>
                      <div className="flex items-baseline gap-1.5 mt-2 mb-6">
                        <span className="text-[#75f2c6]/60 text-4xl">₹</span>
                        <span className="text-[#75f2c6] font-bold text-6xl tracking-tighter drop-shadow-[0_0_15px_rgba(117,242,198,0.3)]">
                          {amount ? new Intl.NumberFormat('en-IN').format(amount) + '\u00A0/-' : "0.00\u00A0/-"}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 pt-4 border-t border-white/5 mt-auto">
                        <ShieldCheck className="w-3 h-3 text-white/40 mt-0.5 shrink-0" />
                        <p className="text-[10px] text-white/40 leading-relaxed font-medium">
                          SECURITY DISCLAIMER: This is a verified settlement interface. Transaction processing is subject to your bank's native network protocol and UPI verification cipher.
                        </p>
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
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer shrink-0">
                      <ChevronLeft className="w-4 h-4 text-zinc-300" />
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/[0.05] shadow-inner">
                      <ShieldCheck className="w-3.5 h-3.5 text-white" />
                      <span className="text-[13px] font-black text-white tracking-tight">ArcPay</span>
                      <div className="w-[0.5px] h-3 shadow-[0.5px_0_0_rgba(255,255,255,0.3)] mx-1"></div>
                      <img src={arcbyteLogo} alt="ArcByte" className="h-3.5 opacity-100 object-contain" />
                    </div>

                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer shrink-0">
                      <Settings className="w-4 h-4 text-zinc-300" />
                    </div>
                  </div>

                  {/* Simulated App Card (Emerald Green & Black) */}
                  <div className="w-full rounded-[24px] p-6 relative overflow-hidden shadow-2xl mb-8 border border-black/5"
                    style={{ background: 'linear-gradient(135deg, #75f2c6 0%, #a2f9dd 50%, #75f2c6 100%)' }}>
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent opacity-40 pointer-events-none"></div>
                    <img src="https://img.icons8.com/ios-filled/100/bhim-upi.png" alt="BHIM UPI" className="absolute top-6 right-6 h-8 opacity-80" />

                    <div className="mt-4 mb-8">
                      <div className="text-black/60 text-xs font-bold uppercase tracking-wider mb-1">Paying Amount</div>
                      <div className="font-bold text-4xl tracking-tight text-black drop-shadow-sm">
                        {'\u20B9'}{amount ? new Intl.NumberFormat('en-IN').format(amount) + '\u00A0/-' : "0.00\u00A0/-"}
                      </div>
                    </div>

                    <div className="flex gap-12 text-[10px] text-black/60 font-bold uppercase tracking-wider">
                      <div className="flex flex-col">
                        <span className="mb-1 opacity-70">Receiver</span>
                        <span className="text-black text-xs font-black">{PAYEE_NAME}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="mb-1 opacity-70">Payer</span>
                        <span className="text-black text-xs font-black">{payerName || "Valued Payer"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Box (QR only for desktop) */}
                  <div className="px-2 pb-4">
                    {/* Scan instruction for desktop */}
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-6 text-center">Scan To Pay</p>

                    <div className="w-full flex justify-center mb-0">
                      <div className="p-5 rounded-[32px] bg-white shadow-[0_20px_50px_rgba(255,255,255,0.05)] border border-white/10 relative group">
                        <QRCodeSVG
                          value={upiURI}
                          size={210}
                          level={"H"}
                          includeMargin={false}
                          className="rounded-xl transition-transform duration-500 group-hover:scale-[1.02]"
                          imageSettings={{
                            src: "https://img.icons8.com/fluency/96/security-checked--v1.png",
                            x: undefined,
                            y: undefined,
                            height: 40,
                            width: 40,
                            excavate: true,
                          }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={handlePrimaryAction}
                      className="hidden"
                    >
                      Open Bank App
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
                      type="text"
                      inputMode="decimal"
                      value={amount ? new Intl.NumberFormat('en-IN').format(amount) : ''}
                      onChange={(e) => {
                        const rawVal = e.target.value.replace(/,/g, '');
                        if (rawVal === '') {
                          setAmount('');
                          return;
                        }
                        const num = Number(rawVal);
                        if (!isNaN(num) && num <= 100000) {
                          setAmount(rawVal);
                        }
                      }}
                      placeholder="0"
                      className="w-full bg-[#151518] focus:bg-[#1a1a1e] border border-white/[0.05] focus:border-[#75f2c6] px-6 py-4 rounded-full outline-none text-white font-medium text-lg transition-colors placeholder:text-zinc-600"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold tracking-wide text-zinc-300 mb-3 px-2">
                      Receiver Name
                    </p>
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        readOnly
                        className="w-full bg-[#0a0a0c] border border-[white]/5 px-6 py-4 rounded-full outline-none text-zinc-400 font-bold transition-colors cursor-not-allowed opacity-80"
                      />
                      <ShieldCheck className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#75f2c6]/40" />
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold tracking-wide text-zinc-300 mb-3 px-2 flex justify-between">
                      <span>Payer Name</span> <span className="text-[#75f2c6] text-[10px] uppercase tracking-widest align-bottom">Required</span>
                    </p>
                    <input
                      type="text"
                      value={payerName}
                      onChange={(e) => setPayerName(e.target.value)}
                      placeholder="Enter payer's name..."
                      className="w-full bg-[#151518] focus:bg-[#1a1a1e] border border-white/[0.05] focus:border-zinc-500 px-6 py-4 rounded-full outline-none text-white font-medium transition-colors placeholder:text-zinc-600"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold tracking-wide text-white mb-3 px-2 flex justify-between">
                      <span>Payment Note</span> <span className="text-[#75f2c6] text-[10px] uppercase tracking-widest align-bottom">Required</span>
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
                <div className="absolute top-20 right-0 w-[420px] h-[420px] rounded-[40px] shadow-2xl overflow-hidden backdrop-blur-3xl border border-white/5 z-20 flex flex-col p-10 bg-[#151518]">
                  <div className="flex justify-between items-center w-full mb-12 px-1">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4.5 h-4.5 text-white" />
                      <span className="text-sm font-black text-white tracking-tight leading-none">ArcPay</span>
                      <div className="w-[0.5px] h-3.5 shadow-[0.5px_0_0_rgba(255,255,255,0.3)] mx-1"></div>
                      <img src={arcbyteLogo} alt="ArcByte" className="h-3.5 opacity-100 object-contain" />
                    </div>
                    <Wallet className="w-5 h-5 text-[#75f2c6]/60" />
                  </div>

                  <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">To Receiver</div>
                  <div className="text-white font-bold text-2xl tracking-tight mb-8 leading-tight">{name || "Anonymous Client"}</div>

                  <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">From Payer</div>
                  <div className="text-[#75f2c6] font-bold text-2xl tracking-tight mb-8 leading-tight">{payerName || "Valued Payer"}</div>

                  <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">Requesting</div>
                  <div className="text-[#75f2c6] font-black text-5xl tracking-tighter mb-10 drop-shadow-[0_0_15px_rgba(117,242,198,0.2)] leading-none">
                    <span className="text-[#75f2c6]/60 text-3xl mr-1 self-center">₹</span>
                    {amount ? new Intl.NumberFormat('en-IN').format(amount) + '\u00A0/-' : "0.00\u00A0/-"}
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
        <ComingSoonSheet isOpen={showHelp} onClose={() => setShowHelp(false)} />
      </div>
    </div>
  );
}
