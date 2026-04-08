import { useRef } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { ShieldCheck, AlertTriangle, ArrowRight, X } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import arcbyteLogo from '../../assets/arcbyte_logo_white_transparent.png';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function GlobalStatusSheet() {
  const { isOpen, type, title, message, isLoading, hideStatus } = useNotification();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998]"
            onClick={() => {
              // Only allow background click to close if not loading
              if (!isLoading) hideStatus();
            }}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[9999] bg-[#0a0a0c] border-t border-white/5 rounded-t-[40px] px-8 pt-4 pb-12 sm:pb-20 md:max-w-2xl md:mx-auto shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
          >
            {/* Grab Handle */}
            <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-8 opacity-40" />

            {/* Header Content */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-3 mb-10">
                <ShieldCheck className={cn(
                  "w-6 h-6",
                  type === 'success' ? "text-[#d4ff3f]" : type === 'error' ? "text-red-500" : "text-zinc-500"
                )} strokeWidth={2.5} />
                <div className="w-[1px] h-5 bg-white/20" />
                <img src={arcbyteLogo} className="h-5 opacity-90 object-contain" alt="ArcByte" />
              </div>

              <div className="text-center mb-10">
                <h2 className={cn(
                  "text-4xl sm:text-5xl font-black italic uppercase tracking-tighter mb-4",
                  type === 'success' ? "text-white" : type === 'error' ? "text-red-500" : "text-white"
                )}>
                  {title || (type === 'success' ? 'SUCCESS' : type === 'error' ? 'ALERTE' : 'STATUS')}
                  {type === 'success' && <span className="text-[#d4ff3f]"> VERIFIED</span>}
                </h2>
                <div className="max-w-xs mx-auto">
                   <p className="text-zinc-500 text-sm sm:text-base font-medium leading-relaxed">
                    {message}
                  </p>
                </div>
              </div>

              {/* Interaction Layer */}
              <div className="w-full max-w-sm">
                <SlideToClose 
                  onComplete={hideStatus} 
                  isLoading={isLoading}
                  type={type}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const SlideToClose = ({ onComplete, isLoading, type }) => {
  const containerRef = useRef(null);
  const x = useMotionValue(0);

  const isError = type === 'error';

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-[68px] bg-[#151518] rounded-full overflow-hidden flex items-center border border-white/5 shadow-[inset_0_4px_10px_rgba(0,0,0,0.5)] transition-all duration-500",
        isLoading && "opacity-50 pointer-events-none"
      )}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-zinc-500 font-extrabold tracking-[0.25em] text-[10px] uppercase">
          {isLoading ? "Checking Security..." : "SLIDE TO CLOSE"}
        </span>
      </div>

      <motion.div
        drag={isLoading ? false : "x"}
        style={{ x }}
        dragConstraints={{ left: 0, right: containerRef.current ? containerRef.current.offsetWidth - 72 : 300 }}
        dragElastic={0.05}
        dragSnapToOrigin={true}
        onDragEnd={(e, info) => {
          if (!isLoading && containerRef.current) {
            const trackWidth = containerRef.current.offsetWidth;
            if (x.get() > (trackWidth - 85)) {
              onComplete();
            }
          }
        }}
        animate={!isLoading ? { x: [0, 8, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
        className={cn(
          "absolute left-2 top-2 bottom-2 w-[52px] rounded-full flex items-center justify-center z-10",
          isLoading ? "cursor-not-allowed bg-zinc-800" : 
          isError ? "cursor-grab active:cursor-grabbing bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]" :
          "cursor-grab active:cursor-grabbing bg-white shadow-[0_0_20px_rgba(255,255,255,0.4)]"
        )}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <ArrowRight className={cn("w-5 h-5 stroke-[3px]", isError ? "text-white" : "text-black")} />
        )}
      </motion.div>
    </div>
  );
};
