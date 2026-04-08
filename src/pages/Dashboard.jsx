import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, ArrowRight, Check, Clock, Smartphone, QrCode, Settings, ChevronLeft, Wallet, Download, ShieldCheck, FileText, Lock, HelpCircle, ExternalLink, Upload, Copy, Info, Building2, CreditCard, User, Eye, EyeOff, Image as ImageIcon, Landmark, AlertTriangle } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

import arcbyteLogo from '../assets/arcbyte_logo_white_transparent.png';
import razorpayPopupLogo from '../assets/arcbyte.co_white_logo.png';
import paytmLogo from '../assets/paytm.png';
import upiLogo from '../assets/upi.png';
import federalBankLogo from '../assets/Federal_bank_India.svg.png';
import razorpayLogo from '../assets/razorpay_logo.png';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}
import SEO from '../components/common/SEO';

const PAYEE_VPA = import.meta.env.VITE_PAYEE_VPA || 'aidan.rodrigues@superyes';
const PAYEE_NAME = import.meta.env.VITE_PAYEE_NAME || 'Aidan Rodrigues';
const SECURITY_SALT = 'ARC_SEC_2024_PROT'; // Internal integrity salt
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY || 'rzp_live_SanzAuU0NicySW';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

// Integrity Signer
const signPayload = (data) => {
  const json = JSON.stringify(data);
  const signature = btoa(json + SECURITY_SALT).substring(0, 12);
  return `${btoa(json)}--${signature}`;
};

// Integrity Verifier
const verifyPayload = (payload) => {
  try {
    const [encodedJson, signature] = payload.split('--');
    const json = atob(encodedJson);
    const expectedSignature = btoa(json + SECURITY_SALT).substring(0, 12);
    if (signature !== expectedSignature) return null;
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
};

// Integrity Verifier
const DEFAULT_BANK_DETAILS = {
  holder: "Aidan Daniel Rodrigues",
  account: "77770136333982",
  ifsc: "FDRL0000001",
  branch: "NEO BANKING JUPITER",
  swift: "FDRLINBBIBD",
  micr: "682049069",
  mmid: "9049982"
};

const PaymentMethodSelector = ({ method, onChange }) => {
  return (
    <div className="relative flex p-1.5 bg-[#151518] rounded-full border border-white/5 mb-8 overflow-hidden">
      <button
        onClick={() => onChange('upi')}
        className={cn(
          "relative flex-[1.2] flex items-center justify-center gap-2 py-2.5 rounded-full z-10 transition-colors duration-500",
          method === 'upi' ? "text-black font-black" : "text-zinc-500 hover:text-zinc-300 font-bold"
        )}
      >
        {method === 'upi' && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-[#d4ff3f] rounded-full shadow-[0_0_20px_rgba(117,242,198,0.3)] z-0"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
        <QrCode className={cn("relative z-10 w-3.5 h-3.5 transition-transform duration-500", method === 'upi' && "scale-110")} />
        <span className="relative z-10 text-[9px] uppercase tracking-[0.15em]">UPI</span>
      </button>

      <button
        onClick={() => onChange('bank')}
        className={cn(
          "relative flex-[1.2] flex items-center justify-center gap-2 py-2.5 rounded-full z-10 transition-colors duration-500",
          method === 'bank' ? "text-black font-black" : "text-zinc-500 hover:text-zinc-300 font-bold"
        )}
      >
        {method === 'bank' && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-[#d4ff3f] rounded-full shadow-[0_0_20px_rgba(117,242,198,0.3)] z-0"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
        <Building2 className={cn("relative z-10 w-3.5 h-3.5 transition-transform duration-500", method === 'bank' && "scale-110")} />
        <span className="relative z-10 text-[9px] uppercase tracking-[0.15em]">Bank</span>
      </button>

      <button
        onClick={() => onChange('razorpay')}
        className={cn(
          "relative flex-[1.5] flex items-center justify-center gap-2 py-2.5 rounded-full z-10 transition-colors duration-500",
          method === 'razorpay' ? "text-black font-black" : "text-zinc-500 hover:text-zinc-300 font-bold"
        )}
      >
        {method === 'razorpay' && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-[#d4ff3f] rounded-full shadow-[0_0_20px_rgba(117,242,198,0.3)] z-0"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
        <img src={razorpayLogo} alt="RazorPay" className={cn("relative z-10 w-3.5 h-auto object-contain transition-transform duration-500", method === 'razorpay' && "scale-110 filter brightness-100 invert-0", method !== 'razorpay' && "opacity-50 grayscale")} />
        <span className="relative z-10 text-[9px] uppercase tracking-[0.15em]">RazorPay</span>
      </button>
    </div>
  );
};

const BankDetailsCard = ({ details }) => {
  const [expanded, setExpanded] = useState(false);
  const { showStatus } = useNotification();

  const handleCopy = (text, label) => {
    copyToClipboard(text);
    showStatus({ 
      type: 'success', 
      title: 'DATA CRYPTOGRAPHY', 
      message: `${label} encoded and copied to secure clipboard.` 
    });
  };

  return (
    <div className="w-full bg-[#151518] border border-white/5 rounded-[32px] p-6 lg:p-8 shadow-2xl relative overflow-hidden group">
      {/* Decorative background logo */}
      <div className="absolute -right-20 -top-20 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-700">
        <ShieldCheck className="w-64 h-64 text-white" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-[#d4ff3f]" />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-0.5">Settlement Method</p>
              <p className="text-white font-bold text-sm tracking-tight leading-none">Bank Transfer</p>
            </div>
          </div>
          <img src={federalBankLogo} alt="Federal Bank" className="h-8 opacity-100 shrink-0" />
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 px-1">Account Holder</p>
            <p className="text-white text-lg font-black tracking-tight bg-white/5 p-4 rounded-2xl border border-white/5">{details.holder}</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="bg-[#0a0a0c] border border-white/5 p-4 py-5 rounded-2xl relative group/item">
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3">Account Number</p>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[#d4ff3f] text-xl font-black tracking-widest font-mono">{details.account}</span>
                <button
                  onClick={() => handleCopy(details.account, "Account Number")}
                  className="p-3 rounded-xl bg-white/5 hover:bg-[#d4ff3f] text-white hover:text-black transition-all"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-[#0a0a0c] border border-white/5 p-4 py-5 rounded-2xl relative group/item">
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3">IFSC Code</p>
              <div className="flex items-center justify-between gap-4">
                <span className="text-white text-xl font-black tracking-widest font-mono">{details.ifsc}</span>
                <button
                  onClick={() => handleCopy(details.ifsc, "IFSC Code")}
                  className="p-3 rounded-xl bg-white/5 hover:bg-[#d4ff3f] text-white hover:text-black transition-all"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] hover:text-white transition-colors"
            >
              <Info className={cn("w-3 h-3 transition-transform", expanded && "rotate-180")} />
              {expanded ? "Hide Details" : "More Account Details"}
            </button>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-4 pt-6">
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1.5">Branch</p>
                      <p className="text-white/80 text-[10px] font-bold truncate">{details.branch}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1.5">Swift Code</p>
                      <p className="text-white/80 text-[10px] font-bold">{details.swift}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1.5">MICR Code</p>
                      <p className="text-white/80 text-[10px] font-bold">{details.micr}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1.5">MMID</p>
                      <p className="text-white/80 text-[10px] font-bold">{details.mmid}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

const BankConfirmationSheet = ({
  isOpen, onClose, onConfirm, amount, setAmount,
  name, payerName, setPayerName, note, setNote
}) => {
  const [localTxId, setLocalTxId] = useState('');
  const [localScreenshot, setLocalScreenshot] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showInputs, setShowInputs] = useState(false);
  const [showAllDetails, setShowAllDetails] = useState(false);

  // Reset showInputs when sheet opens
  useEffect(() => {
    if (isOpen) {
      setShowInputs(false);
      setShowAllDetails(false);
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalScreenshot(reader.result);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAction = () => {
    if (!localTxId.trim()) {
      showStatus({ 
        type: 'error', 
        title: 'PROTOCOL ERROR', 
        message: "Transaction ID hash is required for verification." 
      });
      return;
    }
    if (!localScreenshot) {
      showStatus({ 
        type: 'error', 
        title: 'INTEGRITY CHECK', 
        message: "Visual proof of transfer is required to commit status." 
      });
      return;
    }
    onConfirm(localTxId, localScreenshot);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[120]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-[#0a0a0c] rounded-t-[40px] border-t border-white/10 z-[120] p-8 pb-12 shadow-[0_-40px_80px_rgba(0,0,0,0.9)] max-w-lg mx-auto max-h-[92vh] overflow-y-auto"
          >
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-8 shrink-0" />

            <div className="flex items-center justify-center gap-2 sm:gap-2.5 mb-10">
              < ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#d4ff3f] drop-shadow-[0_0_10px_rgba(117,242,198,0.3)] stroke-[2.5]" />
              <span className="text-lg sm:text-xl font-bold tracking-tight text-white">ArcPay</span>
              <div className="w-[1px] h-4 sm:h-5 bg-white/20 mx-2 sm:mx-3"></div>
              <img src={arcbyteLogo} alt="ArcByte" className="h-4 sm:h-5 w-auto object-contain opacity-80" />
            </div>

            <h3 className="text-3xl font-black text-white mb-8 text-center tracking-[-0.04em]">
              Confirm <span className="text-[#d4ff3f] relative inline-block">
                Transfer
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                  className="absolute -bottom-1.5 left-0 h-1 bg-[#d4ff3f] rounded-full"
                />
              </span>
            </h3>

            <div className="space-y-0.5 mb-10">
              <div className="py-4 border-b border-white/[0.03]">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <CreditCard className="w-3 h-3 text-zinc-600" />
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Beneficiary Account</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[#d4ff3f] text-2xl font-black tracking-widest font-mono drop-shadow-[0_0_15px_rgba(117,242,198,0.2)]">
                    {DEFAULT_BANK_DETAILS.account}
                  </p>
                  <button
                    onClick={() => {
                      copyToClipboard(DEFAULT_BANK_DETAILS.account);
                      showStatus({ type: 'success', title: 'COPY SUCCESS', message: 'Account number transferred to clipboard.' });
                    }}
                    className="p-2.5 rounded-xl bg-white/5 text-zinc-400 hover:text-white transition-all border border-white/5 hover:border-[#d4ff3f]/30 active:scale-95"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="py-4 border-b border-white/[0.03]">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Building2 className="w-3 h-3 text-zinc-600" />
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">IFSC Code</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-white text-2xl font-black tracking-widest font-mono">
                    {DEFAULT_BANK_DETAILS.ifsc}
                  </p>
                  <button
                    onClick={() => {
                      copyToClipboard(DEFAULT_BANK_DETAILS.ifsc);
                      showStatus({ type: 'success', title: 'COPY SUCCESS', message: 'IFSC protocol copied.' });
                    }}
                    className="p-2.5 rounded-xl bg-white/5 text-zinc-400 hover:text-white transition-all border border-white/5 hover:border-[#d4ff3f]/30 active:scale-95"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="py-4 border-b border-white/[0.03]">
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  <User className="w-3 h-3 text-zinc-600" />
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Account Holder</p>
                </div>
                <p className="text-white font-black text-lg tracking-tight px-1">{DEFAULT_BANK_DETAILS.holder}</p>
              </div>

              <div className="pt-4 pb-2">
                <button
                  onClick={() => setShowAllDetails(!showAllDetails)}
                  className="flex items-center gap-3 group/btn py-2"
                >
                  <div className="flex items-center gap-3">
                    {showAllDetails ? (
                      <EyeOff className="w-3.5 h-3.5 text-[#d4ff3f] transition-all duration-500" />
                    ) : (
                      <Eye className="w-3.5 h-3.5 text-zinc-500 group-hover/btn:text-white transition-all duration-500" />
                    )}
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] group-hover/btn:text-white transition-colors">
                      {showAllDetails ? "Hide Secondary Details" : "View All Account Details"}
                    </span>
                  </div>
                </button>

                <AnimatePresence>
                  {showAllDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pt-8 space-y-8 pb-4">
                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2">Branch</p>
                            <p className="text-white/80 font-bold text-xs uppercase">{DEFAULT_BANK_DETAILS.branch}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2">SWIFT / BIC</p>
                            <p className="text-white/80 font-mono text-xs">{DEFAULT_BANK_DETAILS.swift}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2">MICR Code</p>
                            <p className="text-white/80 font-mono text-xs">{DEFAULT_BANK_DETAILS.micr}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2">MMID</p>
                            <p className="text-white/80 font-mono text-xs">{DEFAULT_BANK_DETAILS.mmid}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!showInputs ? (
                <motion.div
                  key="details-step"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <SlideToPay text="COMPLETE TO LOG PAYMENT" onComplete={() => setShowInputs(true)} />
                </motion.div>
              ) : (
                <motion.div
                  key="inputs-step"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-0.5 pt-8"
                >

                  {/* Document Input List */}
                  <div className="space-y-0.5 mb-10">

                    <div className="py-6 border-b border-white/[0.03]">
                      <div className="flex items-center gap-2 mb-4 px-1">
                        <FileText className="w-3 h-3 text-zinc-600" />
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Transaction ID (UTR)</p>
                      </div>
                      <input
                        type="text"
                        value={localTxId}
                        onChange={(e) => setLocalTxId(e.target.value)}
                        placeholder="Enter UTR or reference number"
                        className="w-full bg-transparent border-b border-white/5 focus:border-[#d4ff3f]/50 py-2 outline-none text-white font-black text-lg tracking-widest font-mono placeholder:text-zinc-800 transition-all px-1"
                      />
                    </div>
                  </div>


                  <div className="py-8">
                    <div className="flex items-center gap-2 mb-6 px-1">
                      <ImageIcon className="w-3 h-3 text-zinc-600" />
                      <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Proof of Transfer (Screenshot)</p>
                    </div>

                    <div className="relative group/upload">
                      <input
                        type="file"
                        id="receipt-upload-confirmation"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      {localScreenshot ? (
                        <div className="relative rounded-3xl overflow-hidden border border-white/10 group-hover/upload:border-[#d4ff3f]/30 transition-all duration-500">
                          <img
                            src={localScreenshot}
                            alt="Receipt Preview"
                            className="w-full h-48 object-cover opacity-60 group-hover/upload:opacity-80 transition-opacity"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                            <label
                              htmlFor="receipt-upload-confirmation"
                              className="px-6 py-2.5 rounded-full bg-white text-black font-black text-[10px] uppercase tracking-widest cursor-pointer hover:scale-105 transition-transform"
                            >
                              Replace Image
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label
                          htmlFor="receipt-upload-confirmation"
                          className="flex flex-col items-center justify-center py-16 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-[#d4ff3f]/20 transition-all duration-500 cursor-pointer group/label"
                        >
                          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 group-hover/label:text-[#d4ff3f] group-hover/label:bg-[#d4ff3f]/10 transition-all duration-500 mb-6 border border-white/5">
                            {isUploading ? (
                              <div className="w-5 h-5 border-2 border-[#d4ff3f] border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Upload className="w-5 h-5" />
                            )}
                          </div>
                          <div className="text-center">
                            <p className="text-zinc-300 font-black text-[11px] uppercase tracking-[0.2em]">Upload Payment Specification</p>
                            <p className="text-zinc-600 text-[8px] font-black uppercase tracking-[0.2em] mt-2">JPEG, PNG Max 5MB</p>
                          </div>
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="pt-6">
                    <SlideToPay
                      text="SLIDE TO CONFIRM"
                      onComplete={handleAction}
                      disabled={localTxId.length < 12 || !localScreenshot || isUploading}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const InvoiceTemplate = ({ amount, name, txId, method, invoiceId, note, payerName, payerEmail, payerPhone }) => {
  return (
    <div
      id="arcpay-invoice-print"
      className="w-[800px] bg-black text-white p-12 font-sans relative overflow-hidden flex flex-col min-h-[1100px]"
      style={{ scale: '1' }}
    >
      {/* Background Watermark/Aesthetic */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#d4ff3f]/[0.03] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#d4ff3f]/[0.02] rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-start mb-20">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-[#d4ff3f]" strokeWidth={2.5} />
              <span className="text-3xl font-black tracking-tight">ArcPay</span>
            </div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em]">Payment Verified</p>
          </div>
          <div className="text-right">
            <h1 className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Digital Receipt</h1>
            <p className="text-xl font-black tracking-tight">{invoiceId || "ARC-INV-TEMP"}</p>
            <p className="text-zinc-500 text-[9px] font-bold uppercase mt-1 tracking-widest">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Amount Section */}
        <div className="mb-20 py-16 border-y border-white/[0.05]">
          <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] block mb-4">Total Amount Settled</span>
          <div className="flex items-baseline gap-4">
            <span className="text-[#d4ff3f] text-3xl font-black">₹</span>
            <span className="text-[#d4ff3f] text-8xl font-black tracking-tighter">
              {new Intl.NumberFormat('en-IN').format(Number(amount))}
            </span>
            <span className="text-[#d4ff3f]/40 text-2xl font-black ml-2 uppercase tracking-widest">INR</span>
          </div>
        </div>

        {/* Transaction Grid */}
        <div className="grid grid-cols-2 gap-y-12 gap-x-20 mb-20">
          <div>
            <h4 className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em] mb-3">Recipient</h4>
            <p className="text-xl font-black text-white">{name}</p>
            <p className="text-[11px] text-zinc-500 font-bold uppercase mt-1 tracking-widest leading-loose">Technology Interface: ArcPay Ecology</p>
          </div>
          <div>
            <h4 className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em] mb-3">Payer Details</h4>
            <p className="text-xl font-black text-white">{payerName || "Anonymous Payer"}</p>
            <div className="flex flex-col gap-1 mt-2">
              {payerEmail && <p className="text-[10px] text-zinc-400 font-bold tracking-wider underline underline-offset-4 decoration-zinc-800">{payerEmail.toLowerCase()}</p>}
              {payerPhone && <p className="text-[10px] text-zinc-500 font-bold tracking-widest mt-1">{payerPhone}</p>}
            </div>
          </div>
          <div>
            <h4 className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em] mb-3">Settlement Method</h4>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#d4ff3f] shadow-[0_0_8px_rgba(117,242,198,0.5)]" />
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#d4ff3f]">
                {method === 'bank' ? 'Bank Transfer' : method === 'razorpay' ? 'RazorPay Gateway' : 'UPI Payment'}
              </p>
            </div>
          </div>
          <div>
            <h4 className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em] mb-3">Transaction ID / UTR</h4>
            <p className="text-xs font-black font-mono tracking-widest text-[#d4ff3f] break-all max-w-[280px] leading-relaxed">
              {txId}
            </p>
          </div>
        </div>

        {/* Notes */}
        {note && (
          <div className="mb-20 p-8 bg-zinc-900/40 border border-white/[0.03] rounded-3xl">
            <h4 className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em] mb-4 text-center">Reference Note</h4>
            <p className="text-zinc-300 text-center font-medium leading-relaxed italic italic pr-4 pl-4 font-sans text-lg">
              "{note}"
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto border-t border-white/[0.05] pt-12 flex justify-between items-end">
          <div className="max-w-[300px]">
            <p className="text-[8px] leading-relaxed font-bold uppercase tracking-widest text-zinc-600 mb-2">Security Verified</p>
            <p className="text-[9px] leading-relaxed text-zinc-500 font-medium">
              This document is a system-generated payment receipt. ArcPay is a payment tool and does not directly manage or hold user funds. Security is verified by the ArcPay System.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <img src={arcbyteLogo} alt="ArcByte" className="h-4 opacity-100 object-contain brightness-200 grayscale contrast-150 mb-2" />
            <div className="bg-[#d4ff3f] text-black text-[7px] font-black px-3 py-1 rounded-full tracking-[0.2em] uppercase">
              Authenticated Receipt
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SuccessState = ({ amount, name, txId, method, invoiceId, note, payerName, payerEmail, payerPhone }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { showStatus } = useNotification();

  const handleDownloadInvoice = async () => {
    setIsDownloading(true);
    const loadingToast = showStatus({ 
      type: 'loading', 
      title: 'GENERATING', 
      message: "Generating high-fidelity invoice..." 
    });

    try {
      // Small delay to ensure the template is rendered if we just added it to DOM
      await new Promise(resolve => setTimeout(resolve, 500));

      const element = document.getElementById('arcpay-invoice-print');
      if (!element) throw new Error("Template not found");

      const canvas = await html2canvas(element, {
        scale: 2, // High DPI
        backgroundColor: '#000000',
        logging: false,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [800, 1100] // Match template dimensions
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 800, 1100);
      pdf.save(`ArcPay_Invoice_${invoiceId || 'RC'}.pdf`);

      showStatus({ type: 'success', title: 'DOWNLOAD SUCCESS', message: 'Invoice downloaded successfully!' });
    } catch (err) {
      console.error('Invoice Generation Error:', err);
      showStatus({ type: 'error', title: 'GENERATION FAILURE', message: 'Failed to generate digital invoice.' });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 px-8 text-center"
      >
        <div className="relative mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
            className="w-32 h-32 rounded-full bg-[#d4ff3f] flex items-center justify-center shadow-[0_0_50px_rgba(117,242,198,0.4)]"
          >
            <Check className="w-16 h-16 text-black stroke-[4]" />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-[#d4ff3f]"
          />
        </div>

        <h3 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-[-0.04em] leading-tight">
          Payment <span className="text-[#d4ff3f]">Received</span>
        </h3>
        <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px] mb-12 px-8 max-w-sm mx-auto leading-relaxed">
          {method === 'razorpay'
            ? "Your transaction has been captured and settled instantly via Razorpay. Status: Finalized."
            : "Our team will take 8-12 hours to review your manual payment. We will update you via mail."}
        </p>

        <div className="w-full max-w-sm space-y-0.5 mb-12">
          <div className="py-5 border-b border-white/[0.03] flex justify-between items-center group">
            <div className="flex items-center gap-2">
              <Wallet className="w-3 h-3 text-zinc-600" />
              <span className="text-zinc-500 font-black uppercase tracking-[0.2em] text-[9px]">Amount Paid</span>
            </div>
            <span className="text-white font-black text-lg">₹{new Intl.NumberFormat('en-IN').format(Number(amount))}</span>
          </div>

          <div className="py-5 border-b border-white/[0.03] flex justify-between items-center group">
            <div className="flex items-center gap-2">
              <User className="w-3 h-3 text-zinc-600" />
              <span className="text-zinc-500 font-black uppercase tracking-[0.2em] text-[9px]">Receiver</span>
            </div>
            <span className="text-white font-black text-lg">{name}</span>
          </div>

          <div className="py-5 border-b border-white/[0.03] flex justify-between items-center group">
            <div className="flex items-center gap-2">
              <Smartphone className="w-3 h-3 text-zinc-600" />
              <span className="text-zinc-500 font-black uppercase tracking-[0.2em] text-[10px]">Method</span>
            </div>
            <span className="text-[#d4ff3f] font-black tracking-widest text-[10px]">
              {method === 'bank' ? 'Bank Transfer' : method === 'razorpay' ? 'RazorPay Gateway' : 'UPI Payment'}
            </span>
          </div>

          <div className="py-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <FileText className="w-3 h-3 text-zinc-600" />
              <span className="text-zinc-500 font-black uppercase tracking-[0.2em] text-[9px]">Transaction / UTR ID</span>
            </div>
            <p className="text-white font-black text-2xl sm:text-3xl font-mono tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              {txId}
            </p>
          </div>
        </div>

        <div className="w-full max-w-sm flex flex-col gap-4">
          <button
            onClick={handleDownloadInvoice}
            disabled={isDownloading}
            className="w-full py-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-3 group"
          >
            {isDownloading ? (
              <div className="w-4 h-4 border-2 border-[#d4ff3f] border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4 text-[#d4ff3f] group-hover:-translate-y-1 transition-transform" />
            )}
            <span className="text-[11px] font-black text-zinc-300 uppercase tracking-[0.1em]">Download Digital Invoice</span>
          </button>

          <SlideToPay
            text="SLIDE TO DISMISS"
            onComplete={() => {
              window.location.href = '/';
            }}
          />
        </div>
      </motion.div>

    </div>
  );
};
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
  const [showQR, setShowQR] = useState(false);
  const upiURI = `upi://pay?${upiParams}`;

  // Reset view when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setShowQR(false), 300);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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

            <AnimatePresence mode="wait">
              {!showQR ? (
                <motion.div
                  key="app-grid"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <h3 className="text-2xl sm:text-3xl text-white mb-10 text-center font-bold tracking-tight">
                    Select <span className="text-[#d4ff3f] relative inline-block drop-shadow-[0_0_15px_rgba(212,255,63,0.3)]">
                      Payment
                      <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }} className="absolute -bottom-1.5 left-0 h-1 bg-[#d4ff3f] rounded-full" />
                      <div className="absolute -bottom-1.5 left-0 w-full h-1 bg-[#d4ff3f]/20 rounded-full blur-[2px]" />
                    </span> App
                  </h3>

                  <div className="grid grid-cols-4 gap-y-10 gap-x-4 max-w-sm mx-auto mb-10">
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
                          window.location.href = `${app.prefix}${upiParams}`;
                          setTimeout(() => onClose(), 150);
                        }}
                        className="flex flex-col items-center gap-3 group"
                      >
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[22px] flex items-center justify-center relative overflow-hidden drop-shadow-xl hover:drop-shadow-2xl group-hover:-translate-y-1 transition-all duration-300">
                          {app.iconUrl ? (
                            <img src={app.iconUrl} alt={app.name} className="w-full h-full object-contain z-10 transition-transform group-hover:scale-105" />
                          ) : (
                            <span className="text-white font-black text-xl">{app.name.charAt(0)}</span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-zinc-500 group-hover:text-white tracking-[0.1em] uppercase mt-1 transition-colors">{app.name}</span>
                      </a>
                    ))}
                  </div>

                  <div className="flex flex-col items-center gap-4 mb-8">
                    <button
                      onClick={() => setShowQR(true)}
                      className="group flex flex-col items-center gap-2"
                    >
                      <div className="flex items-center gap-2 mb-1 py-3 px-6 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                        <QrCode className="w-3.5 h-3.5 text-[#d4ff3f]" />
                        <span className="text-[10px] font-black text-zinc-500 group-hover:text-[#d4ff3f] tracking-[0.2em] uppercase transition-colors">
                          Pay via QR Code
                        </span>
                      </div>
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="qr-view"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col items-center"
                >
                  <h3 className="text-3xl text-white mb-10 text-center">
                    Scan <span className="text-[#d4ff3f] relative inline-block drop-shadow-[0_0_15px_rgba(117,242,198,0.3)]">
                      QR Code
                      <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }} className="absolute -bottom-1.5 left-0 h-1 bg-[#d4ff3f] rounded-full" />
                    </span>
                  </h3>

                  <div className="relative group/qr p-6 rounded-[40px] bg-[#f8fcfb] border border-white/20 shadow-[0_30px_60px_rgba(212,255,63,0.15)] mb-10">
                    <QRCodeSVG
                      value={upiURI}
                      size={200}
                      level={"H"}
                      fgColor="#0a0a0c"
                      imageSettings={{
                        src: "https://img.icons8.com/fluency/96/security-checked--v1.png",
                        height: 34,
                        width: 34,
                        excavate: true,
                      }}
                    />
                  </div>

                  <button
                    onClick={() => setShowQR(false)}
                    className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] hover:text-white transition-colors mb-4"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    Back to Apps
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <SlideToCancel onComplete={onClose} />

            <div className="flex items-center justify-center gap-3 mt-8 opacity-40 group">
              <img src={arcbyteLogo} alt="ArcByte" className="h-2.5 object-contain grayscale brightness-200" />
              <p className="text-[9px] text-white/80 leading-relaxed font-medium tracking-tight">
                SYSTEM NOTICE: Money will be debited from your linked bank account after proceeding with your selected application. ArcPay is a payment tool.
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

            <h3 className="text-3xl text-white mb-6 text-center">
              Support <span className="text-[#d4ff3f] relative inline-block drop-shadow-[0_0_15px_rgba(117,242,198,0.3)]">
                Coming Soon
                <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }} className="absolute -bottom-1.5 left-0 h-1 bg-[#d4ff3f] rounded-full" />
                <div className="absolute -bottom-1.5 left-0 w-full h-1 bg-[#d4ff3f]/20 rounded-full blur-[2px]" />
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

const SecurityAlertSheet = ({
  isOpen, onClose, type = 'tampered',
  amount, name, txId, method, invoiceId, note, payerName, payerEmail, payerPhone
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { showStatus } = useNotification();

  const handleDownloadInvoice = async () => {
    setIsDownloading(true);
    const loadingToast = showStatus({ 
      type: 'loading', 
      title: 'GENERATING', 
      message: "Generating digital invoice..." 
    });

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const element = document.getElementById('arcpay-invoice-print');
      if (!element) throw new Error("Capture template not initialized");

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#000000',
        useCORS: true
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [800, 1100]
      });

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 800, 1100);
      pdf.save(`ArcPay_Invoice_${invoiceId || 'Settled'}.pdf`);
      showStatus({ type: 'success', title: 'DOWNLOAD SUCCESS', message: 'Invoice downloaded!' });
    } catch (err) {
      console.error(err);
      showStatus({ type: 'error', title: 'DOWNLOAD FAILURE', message: 'Download failed.' });
    } finally {
      setIsDownloading(false);
    }
  };

  const config = {
    settled: {
      color: 'text-[#d4ff3f]',
      bg: 'bg-[#d4ff3f]',
      border: 'border-[#d4ff3f]/20',
      shadow: 'shadow-[0_-40px_80px_rgba(117,242,198,0.2)]',
      icon: <ShieldCheck className="w-6 h-6 text-[#d4ff3f] drop-shadow-[0_0_10px_rgba(117,242,198,0.3)] stroke-[2.5]" />,
      title: "Payment Settled",
      description: "This payment has already been processed. Link is expired to prevent duplicate payments.",
      btnText: "SETTLED - DISMISS LINK"
    },
    missing: {
      color: 'text-amber-500',
      bg: 'bg-amber-500',
      border: 'border-amber-500/20',
      shadow: 'shadow-[0_-40px_80px_rgba(245,158,11,0.2)]',
      icon: <AlertTriangle className="w-6 h-6 text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)] stroke-[2.5]" />,
      title: "Information Required",
      description: "Contact info (Email & Phone) is needed for payment. Please provide them to continue.",
      btnText: "I UNDERSTAND - PROVIDE INFO"
    },
    tampered: {
      color: 'text-red-500',
      bg: 'bg-red-500',
      border: 'border-red-500/20',
      shadow: 'shadow-[0_-40px_80px_rgba(153,27,27,0.3)]',
      icon: <ShieldCheck className="w-6 h-6 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.3)] stroke-[2.5]" />,
      title: "Security Alert",
      description: "An invalid payment link was detected. Access is restricted to protect your account.",
      btnText: "SECURITY THREAT - CANCEL"
    },
    verifying: {
      color: 'text-amber-400',
      bg: 'bg-amber-400',
      border: 'border-amber-400/20',
      shadow: 'shadow-[0_-40px_80px_rgba(245,158,11,0.2)]',
      icon: <Clock className="w-6 h-6 text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)] animate-pulse" />,
      title: "Audit Pending",
      description: "Payment detected. We are currently checking this payment. Your funds are safe.",
      btnText: "AUDIT IN PROGRESS - BACK"
    }
  };

  const active = config[type] || config.tampered;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              "fixed bottom-0 left-0 right-0 bg-[#0a0a0c] rounded-t-[40px] border-t z-[110] p-8 pb-12 max-w-lg mx-auto",
              active.border, active.shadow
            )}
          >
            <div className={cn("w-12 h-1.5 rounded-full mx-auto mb-8 opacity-20", active.bg)} />

            <div className="flex items-center justify-center gap-2 sm:gap-2.5 mb-10">
              {active.icon}
              <span className="text-lg sm:text-xl font-bold tracking-tight text-white">ArcPay</span>
              <div className="w-[1px] h-4 sm:h-5 bg-white/20 mx-2 sm:mx-3"></div>
              <img src={arcbyteLogo} alt="ArcByte" className="h-4 sm:h-5 opacity-90 object-contain grayscale brightness-200" />
            </div>

            <h3 className="text-3xl font-black text-white mb-6 text-center tracking-[-0.04em] leading-tight italic-center-balance">
              {active.title.split(' ')[0]}{" "}
              <span className={cn(active.color, "relative inline-block")}>
                {active.title.split(' ')[1]}
                <div className={cn("absolute -bottom-1.5 left-0 w-full h-1 rounded-full", active.bg)} />
              </span>
            </h3>

            <p className="text-zinc-400 text-center font-medium leading-relaxed max-w-xs mx-auto mb-10">
              {active.description}
            </p>

            <div className="flex flex-col gap-4">
              {type === 'settled' && (
                <button
                  onClick={handleDownloadInvoice}
                  disabled={isDownloading}
                  className="w-full py-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-3 group"
                >
                  {isDownloading ? (
                    <div className="w-4 h-4 border-2 border-[#d4ff3f] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 text-[#d4ff3f] group-hover:-translate-y-1 transition-transform" />
                  )}
                  <span className="text-[11px] font-black text-zinc-300 uppercase tracking-[0.11em]">Download Record Invoice</span>
                </button>
              )}

              <SlideToCancel
                onComplete={onClose}
                text={active.btnText}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const SlideToPay = ({ onComplete, text = "SLIDE TO PAY SECURELY", disabled = false }) => {
  const containerRef = useRef(null);
  const x = useMotionValue(0);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-[64px] bg-[#151518] rounded-full overflow-hidden flex items-center border border-white/10 shadow-[inset_0_4px_10px_rgba(0,0,0,0.5)] mt-8 transition-all duration-500",
        disabled && "opacity-40 grayscale cursor-not-allowed border-transparent"
      )}
    >
      {/* Track text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-zinc-500 font-black tracking-[0.15em] text-[9px] uppercase">
          <CharacterFade text={text} x={x} disabled={disabled} />
        </span>
      </div>

      {/* Draggable thumb */}
      <motion.div
        drag={disabled ? false : "x"}
        style={{ x }}
        dragConstraints={{ left: 0, right: 300 }}
        dragElastic={0.05}
        dragSnapToOrigin={true}
        onDragEnd={(e, info) => {
          if (!disabled && containerRef.current) {
            const trackWidth = containerRef.current.offsetWidth;
            // Activate if dragged past 70%
            if (info.offset.x > trackWidth * 0.7) {
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
          "absolute left-1.5 top-1.5 bottom-1.5 w-[52px] bg-white rounded-full flex items-center justify-center z-10",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-grab active:cursor-grabbing shadow-[0_0_15px_rgba(255,255,255,0.4)]"
        )}
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
        "relative w-full h-[64px] bg-[#d4ff3f] rounded-full overflow-hidden flex items-center shadow-[0_0_30px_rgba(117,242,198,0.3)] mt-8 transition-all",
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
        <ArrowRight className="w-5 h-5 text-[#d4ff3f] stroke-[3px]" />
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
        "relative w-full h-[64px] bg-[#d4ff3f] rounded-full overflow-hidden flex items-center shadow-[0_0_30px_rgba(117,242,198,0.3)] mt-8"
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
        <ArrowRight className="w-5 h-5 text-[#d4ff3f] stroke-[3px]" />
      </motion.div>
    </div>
  );
};

const LinkGeneratedSheet = ({ isOpen, onClose, link }) => {
  const { showStatus } = useNotification();
  const handleCopy = async () => {
    const success = await copyToClipboard(link);
    if (success) {
      showStatus({ 
        type: 'success', 
        title: 'LINK SECURED', 
        message: 'Unique payment link has been synced to your clipboard.' 
      });
    } else {
      showStatus({ 
        type: 'error', 
        title: 'ERROR', 
        message: 'Unable to copy. Please manually select the secure string.' 
      });
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

            <h3 className="text-3xl text-white mb-6 text-center">
              Link <span className="text-[#d4ff3f] relative inline-block drop-shadow-[0_0_15px_rgba(117,242,198,0.3)]">
                Generated
                <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }} className="absolute -bottom-1.5 left-0 h-1 bg-[#d4ff3f] rounded-full" />
                <div className="absolute -bottom-1.5 left-0 w-full h-1 bg-[#d4ff3f]/20 rounded-full blur-[2px]" />
              </span>
            </h3>

            <div className="w-full bg-[#151518] border border-white/5 rounded-2xl p-4 mb-8 flex items-center justify-between overflow-hidden">
              <p className="text-zinc-400 text-sm truncate font-medium flex-1 mr-4">{link}</p>
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                <QrCode className="w-4 h-4 text-[#d4ff3f]" />
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

const InspectionRestrictedSheet = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-[#0a0a0c] rounded-t-[40px] border-t border-red-500/20 z-[200] p-8 pb-12 shadow-[0_-40px_80px_rgba(0,0,0,0.9)] max-w-lg mx-auto"
          >
            <div className="w-12 h-1.5 bg-red-500/20 rounded-full mx-auto mb-8" />

            <div className="flex items-center justify-center gap-2.5 mb-10">
              <ShieldCheck className="w-6 h-6 text-red-500 scale-110 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]" />
              <span className="text-xl font-bold tracking-tight text-white">ArcPay Security</span>
              <div className="w-[1px] h-5 bg-white/10 mx-2"></div>
              <img src={arcbyteLogo} alt="ArcByte" className="h-5 opacity-40 grayscale brightness-200" />
            </div>

            <h3 className="text-3xl text-white mb-6 text-center">
              Action <span className="text-red-500 relative inline-block">
                Restricted
                <div className="absolute -bottom-1.5 left-0 w-full h-1 bg-red-500/30 rounded-full blur-[2px]" />
              </span>
            </h3>

            <p className="text-zinc-500 text-center font-bold uppercase tracking-[0.15em] text-[8px] leading-relaxed max-w-xs mx-auto mb-10">
              Security Settings Active. Right-click and viewing source are disabled to keep your payment safe.
            </p>

            <SlideToCancel onComplete={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const CreatorView = ({
  paymentMethod, setPaymentMethod, amount, setAmount, name, handleNameChange,
  payerName, handlePayerNameChange, note, handleNoteChange, isValid,
  handlePrimaryAction, handleDownloadQR, arcbyteLogo
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start pt-10">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} className="flex flex-col">
        <div className="space-y-2 mb-12">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
              Set Payment <span className="text-[#d4ff3f] drop-shadow-[0_0_15px_rgba(212,255,63,0.3)]">Details</span>
            </h1>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] max-w-md leading-relaxed">
              Enter the payment details below for a professional and safe checkout process.
            </p>
          </div>

        <div className="space-y-6 max-w-md">
          <PaymentMethodSelector method={paymentMethod} onChange={setPaymentMethod} />

          {/* Editorial Amount Specification */}
          <div className="pt-4 pb-10 border-b border-white/[0.03] space-y-4">
            <div className="flex items-center gap-2 mb-2 px-1">
              <Wallet className="w-3.5 h-3.5 text-zinc-600" />
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#d4ff3f]">Payment Amount (INR)</label>
            </div>
            <div className="flex items-center gap-4 px-1">
              <span className="text-[#d4ff3f] text-4xl font-black drop-shadow-[0_0_15px_rgba(117,242,198,0.2)]">₹</span>
              <input
                type="text"
                inputMode="numeric"
                value={amount ? new Intl.NumberFormat('en-IN').format(Number(amount)) : ''}
                onChange={(e) => {
                  const rawVal = e.target.value.replace(/,/g, '');
                  if (rawVal === '' || /^\d+$/.test(rawVal)) {
                    setAmount(rawVal === '' ? 0 : Number(rawVal));
                  }
                }}
                placeholder="0"
                className="w-full bg-transparent overflow-hidden text-white font-mono text-5xl font-black tracking-tighter outline-none placeholder:text-zinc-800"
              />
            </div>
          </div>

          {/* Document Input List */}
          <div className="space-y-0.5 mb-10">
            <div className="py-6 border-b border-white/[0.03]">
              <div className="flex items-center gap-2 mb-4 px-1">
                <User className="w-3.5 h-3.5 text-zinc-600" />
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Receiver Name</p>
              </div>
              <div className="relative group">
                <div className="absolute left-1 top-1/2 -translate-y-1/2">
                  <ShieldCheck className="w-5 h-5 text-[#d4ff3f] drop-shadow-[0_0_10px_rgba(117,242,198,0.4)]" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Merchant branding name"
                  className="w-full bg-transparent border-b border-white/5 focus:border-[#d4ff3f]/50 py-2 pl-8 outline-none text-white font-black text-lg tracking-tight placeholder:text-zinc-800 transition-all font-sans"
                />
              </div>
            </div>

            <div className="py-6 border-b border-white/[0.03]">
              <div className="flex items-center gap-2 mb-4 px-1">
                <User className="w-3.5 h-3.5 text-zinc-600" />
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Payer Identifier</p>
              </div>
              <input
                type="text"
                value={payerName}
                onChange={(e) => handlePayerNameChange(e.target.value)}
                placeholder="Enter payer's full name"
                className="w-full bg-transparent border-b border-white/5 focus:border-[#d4ff3f]/50 py-2 outline-none text-white font-black text-lg tracking-tight placeholder:text-zinc-800 transition-all font-sans"
              />
            </div>

            <div className="py-6 border-b border-white/[0.03]">
              <div className="flex items-center gap-2 mb-4 px-1">
                <FileText className="w-3.5 h-3.5 text-zinc-600" />
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Payment Note / Ref</p>
              </div>
              <input
                type="text"
                value={note}
                onChange={(e) => handleNoteChange(e.target.value)}
                placeholder="Payment details (e.g. Invoice #123)"
                className="w-full bg-transparent border-b border-white/5 focus:border-[#d4ff3f]/50 py-2 outline-none text-white font-black text-lg tracking-tight placeholder:text-zinc-800 transition-all font-sans"
              />
            </div>
          </div>

          <div className="pt-2">
            <SlideToGenerate
              onComplete={handlePrimaryAction}
              disabled={!isValid}
            />
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1, delay: 0.2 }} className="relative h-[600px] hidden lg:block">
        <div className="absolute top-20 right-0 w-[420px] h-[420px] rounded-[40px] shadow-2xl overflow-hidden backdrop-blur-3xl border border-white/5 z-20 flex flex-col p-10 bg-[#151518]">
          <div className="flex justify-between items-center w-full mb-12 px-1">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4.5 h-4.5 text-white" />
              <span className="text-sm font-black text-white tracking-tight leading-none">ArcPay</span>
              <div className="w-[1px] h-3.5 shadow-[0.5px_0_0_rgba(255,255,255,0.3)] mx-1"></div>
              <img src={arcbyteLogo} alt="ArcByte" className="h-3.5 opacity-100 object-contain" />
            </div>
            <Wallet className="w-5 h-5 text-[#d4ff3f]/60" />
          </div>

          <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">To Receiver</div>
          <div className="text-white font-bold text-2xl tracking-tight mb-8 leading-tight">{name || "Anonymous Client"}</div>

          <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">From Payer</div>
          <div className="text-[#d4ff3f] font-bold text-2xl tracking-tight mb-8 leading-tight">{payerName || "Valued Payer"}</div>

          <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">Requesting</div>
          <div className="text-[#d4ff3f] font-black text-5xl tracking-tighter mb-10 drop-shadow-[0_0_15px_rgba(117,242,198,0.2)] leading-none">
            <span className="text-[#d4ff3f]/60 text-3xl mr-1 self-center">₹</span>
            {amount ? new Intl.NumberFormat('en-IN').format(Number(amount)) + '\u00A0/-' : "0.00\u00A0/-"}
          </div>

          <div className="mt-auto pt-6 border-t border-white/10 flex justify-between items-center">
            <div>
              <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-1">Status</div>
              <div className="flex items-center gap-2 text-[#d4ff3f] font-semibold text-sm">
                <div className="w-2 h-2 rounded-full bg-[#d4ff3f] animate-pulse"></div> Active
              </div>
            </div>

            <button onClick={handleDownloadQR} disabled={!isValid} className={cn("p-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white", !isValid && "opacity-50")}>
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

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
  );
};

const PayerView = ({
  amount, note, name, payerName, invoiceId, paymentMethod, upiURI,
  handlePrimaryAction, PAYEE_NAME, DEFAULT_BANK_DETAILS, arcbyteLogo,
  payerEmail, setPayerEmail, payerPhone, setPayerPhone
}) => {
  return (
    <div className="flex flex-col lg:flex-row items-start justify-center gap-20">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="flex flex-col z-10 w-full lg:w-1/2">
        <h2 className="text-4xl sm:text-5xl text-white mb-6">
          Complete your<br />
          <span className="text-[#d4ff3f]">Payment</span><br />
          Securely
        </h2>
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] max-w-md leading-relaxed mb-12">
              Check the payment details below. Use the security code or choose a payment app to finish your payment.
            </p>
        <div className="mb-10 sm:mb-12 relative group/settlement">
            <div className="text-[9px] font-black uppercase tracking-[0.3em] text-[#d4ff3f] mb-4">Payment Method</div>
          <div className="flex items-center gap-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 pr-6 backdrop-blur-sm transition-all duration-500 hover:bg-white/[0.04] hover:border-white/[0.1] shadow-2xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-10 -left-10 w-20 h-20 bg-[#d4ff3f]/5 blur-3xl rounded-full" />

            {paymentMethod === 'upi' ? (
              <>
                <div className="relative">
                  <img src={upiLogo} alt="UPI" className="h-5 w-auto relative z-10" />
                  <div className="absolute inset-0 bg-[#d4ff3f]/20 blur-lg rounded-full opacity-0 group-hover/settlement:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl text-white uppercase">UPI</h3>
                  </div>
                  <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Unified Payments Interface</p>
                </div>
              </>
            ) : paymentMethod === 'razorpay' ? (
              <>
                <div className="w-5 h-5 flex items-center justify-center mr-0.5">
                  <img src={razorpayLogo} alt="RazorPay" className="h-4 w-auto object-contain" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl text-white">RazorPay</h3>
                  </div>
                  <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Secure Card/Netbanking</p>
                </div>
              </>
            ) : (
              <>
                <Landmark className="w-5 h-5 text-amber-500/80 mr-3 shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl text-white">Bank Transfer</h3>
                  </div>
                  <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">IMPS/NEFT/RTGS</p>
                </div>
              </>
            )}
            <ShieldCheck className="w-6 h-6 text-[#d4ff3f] animate-pulse ml-auto opacity-90 drop-shadow-[0_0_12px_rgba(117,242,198,0.4)]" />
          </div>
        </div>

        {/* Section Separator */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent mb-10 sm:mb-12" />

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
              <ShieldCheck className="w-6 h-6 text-[#d4ff3f]" />
              <div>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Payer Name</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-[#d4ff3f] text-lg font-black tracking-tight">{payerName || "Valued Payer"}</p>
                  <span className="text-white/20 text-[10px] font-mono tracking-widest">{invoiceId || "#AP-XXXX"}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {note && (
          <div className="mt-4 mb-8 p-4 px-6 rounded-full bg-[#151518] border border-white/10 max-w-sm">
            <p className="text-zinc-400 text-sm italic">"{note}"</p>
          </div>
        )}

        {/* RazorPay Specific Data Collection */}
        {paymentMethod === 'razorpay' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 mb-12 max-w-sm"
          >
            <div className="h-px w-full bg-white/[0.03] mb-8" />

            <div className="space-y-2">
              <div className="px-1">
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Payer Contact Details</p>
                <div className="space-y-1">
                  <div className="relative group py-4 border-b border-white/[0.03]">
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-[#d4ff3f]">
                      <span className="text-sm font-black">@</span>
                    </div>
                    <input
                      type="email"
                      value={payerEmail}
                      onChange={(e) => setPayerEmail(e.target.value)}
                      placeholder="Email Address"
                      className="w-full bg-transparent pl-8 outline-none text-white font-black text-lg tracking-tight placeholder:text-zinc-900 transition-all font-sans"
                    />
                  </div>
                  <div className="relative group py-4 border-b border-white/[0.03]">
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-[#d4ff3f]">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={payerPhone}
                      onChange={(e) => setPayerPhone(e.target.value)}
                      placeholder="Phone Number"
                      className="w-full bg-transparent pl-8 outline-none text-white font-black text-lg tracking-tight placeholder:text-zinc-900 transition-all font-sans"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Desktop Amount Display - Editorial Flow */}
        <div className="hidden lg:block w-full max-w-md mb-12">
          <div className={cn(
            "w-full rounded-[40px] p-10 border border-white/[0.03] relative overflow-hidden transition-all duration-700 bg-[#0a0a0c] shadow-[0_60px_100px_rgba(0,0,0,0.9)]"
          )}>
            <div className="flex justify-between flex-col relative z-20">
              <div className="flex items-center gap-2 mb-1">
                <QrCode className="w-3 h-3 text-zinc-500" />
                <span className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em]">
                  Paying Amount
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-2 mb-10">
                <span className="text-[#d4ff3f]/60 text-4xl">₹</span>
                <span className="text-white font-bold text-6xl tracking-tighter drop-shadow-[0_0_15px_rgba(117,242,198,0.1)]">
                  {amount ? new Intl.NumberFormat('en-IN').format(Number(amount)) + '\u00A0/-' : "0.00\u00A0/-"}
                </span>
              </div>

              <div className="flex items-start gap-3 pt-8 border-t border-white/[0.04] mt-auto">
                <ShieldCheck className="w-3.5 h-3.5 text-[#d4ff3f] mt-0.5 shrink-0" />
                <p className="text-[9px] leading-relaxed font-bold uppercase tracking-widest text-zinc-600">
              SECURITY NOTICE: This is a safe payment page. ArcPay helps you make direct payments easily.
            </p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-sm lg:hidden">
          <div className={cn(
            "w-full rounded-[40px] p-10 border border-white/[0.03] relative overflow-hidden block mb-8 transition-all duration-700",
            paymentMethod === 'bank'
              ? "bg-[#0a0a0c] shadow-[0_40px_80px_rgba(0,0,0,0.8)]"
              : "bg-[#08080a]"
          )}>
            <div className="flex justify-between flex-col relative z-20">
              <div className="flex items-center gap-2 mb-8 opacity-40">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                <span className="text-[12px] font-black text-white tracking-tight leading-none">ArcPay</span>
                <div className="w-[1px] h-3 bg-white/20 mx-1"></div>
                <img src={arcbyteLogo} alt="ArcByte" className="h-3.5 opacity-100 object-contain" />
                {paymentMethod === 'bank' && (
                  <>
                    <div className="w-[1px] h-3 bg-white/20 mx-1"></div>
                    <img src={federalBankLogo} alt="Federal Bank" className="h-4 opacity-100 object-contain mx-2" />
                  </>
                )}
                {paymentMethod === 'upi' && (
                  <>
                    <div className="w-[1px] h-3 bg-white/20 mx-1"></div>
                    <img src={upiLogo} alt="UPI" className="h-3.5 opacity-100 object-contain mx-1" />
                  </>
                )}
                {paymentMethod === 'razorpay' && (
                  <>
                    <div className="w-[1px] h-3 bg-white/20 mx-1"></div>
                    <div className="w-5 h-5 flex items-center justify-center mx-1">
                      <img src={razorpayLogo} alt="RazorPay" className="h-3 w-auto object-contain" />
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 mb-1">
                <QrCode className="w-3 h-3 text-zinc-500" />
                <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
                  Paying Amount
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-2 mb-8">
                <span className="text-[#d4ff3f]/60 text-4xl">₹</span>
                <span className="text-[#d4ff3f] font-bold text-6xl tracking-tighter drop-shadow-[0_0_15px_rgba(117,242,198,0.3)]">
                  {amount ? new Intl.NumberFormat('en-IN').format(Number(amount)) + '\u00A0/-' : "0.00\u00A0/-"}
                </span>
              </div>

              <div className="flex items-start gap-2.5 pt-6 border-t border-white/[0.05] mt-auto">
                <ShieldCheck className="w-3 h-3 text-zinc-500 mt-0.5 shrink-0" />
                <p className="text-[9px] text-zinc-500 leading-relaxed font-bold uppercase tracking-wider">
                  <span className="text-zinc-400">SECURITY NOTICE:</span> This is a safe payment page. ArcPay helps you make direct payments easily.
                </p>
              </div>
            </div>
          </div>

          <SlideToPay onComplete={handlePrimaryAction} />
        </div>
      </motion.div>

      <div className="hidden lg:flex flex-col items-center gap-12 z-10 relative lg:w-1/2">
        <motion.div initial={{ y: 0, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1, delay: 0.2 }} className="flex justify-center w-full">
          <div className="w-[420px] bg-[#0a0a0c] rounded-[56px] shadow-[0_60px_120px_rgba(0,0,0,0.9)] p-6 relative border-[12px] border-[#1c1c20]">
            <div className="flex items-center justify-between px-2 pt-2 mb-8">
              <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <ChevronLeft className="w-4 h-4 text-zinc-300" />
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/[0.05]">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                <span className="text-[13px] font-black text-white tracking-tight">ArcPay</span>
                <div className="w-[1px] h-3 bg-white/20 mx-1"></div>
                <img src={arcbyteLogo} alt="ArcByte" className="h-3 opacity-100 object-contain" />
              </div>
              <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Settings className="w-4 h-4 text-zinc-300" />
              </div>
            </div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="px-2 pb-6 flex flex-col items-center flex-1">
              {paymentMethod === 'bank' && (
                <div className={cn(
                  "w-full rounded-[32px] p-8 border border-white/[0.03] relative overflow-hidden block mb-8 transition-all duration-500",
                  "bg-[#0a0a0c] shadow-[0_0_80px_rgba(117,242,198,0.15)] opacity-100"
                )}>
                  <div className="flex justify-between flex-col relative z-20">
                    <div className="flex items-center gap-2 mb-10 opacity-60">
                      <ShieldCheck className="w-3.5 h-3.5 text-white" />
                      <span className="text-[12px] font-black tracking-tight leading-none text-white">ArcPay</span>
                      <div className="w-[1px] h-3 mx-1 bg-white/20"></div>
                      <img src={arcbyteLogo} alt="ArcByte" className="h-3.5 opacity-100 object-contain" />
                      <div className="w-[1px] h-3 bg-white/20 mx-1"></div>
                      <img src={federalBankLogo} alt="Federal Bank" className="h-4 opacity-100 object-contain mx-2" />
                    </div>

                    <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] block mb-1">
                      Paying Amount
                    </span>
                    <div className="flex items-baseline gap-2 mt-2 mb-10">
                      <span className="text-[#d4ff3f]/60 text-4xl">₹</span>
                      <span className="text-[#d4ff3f] font-bold text-6xl tracking-tighter drop-shadow-[0_0_15px_rgba(117,242,198,0.3)]">
                        {amount ? new Intl.NumberFormat('en-IN').format(Number(amount)) + '\u00A0/-' : "0.00\u00A0/-"}
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5 pt-6 border-t border-white/[0.05] mt-auto">
                      <ShieldCheck className="w-3 h-3 text-zinc-500 mt-0.5 shrink-0" />
                      <p className="text-[9px] leading-relaxed font-bold uppercase tracking-wider text-zinc-500">
                        <span className="text-zinc-400">SECURITY NOTICE:</span> This is a safe payment page. ArcPay helps you make direct payments easily.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'bank' ? (
                <div className="w-full mt-auto">
                  <SlideToPay onComplete={handlePrimaryAction} />
                </div>
              ) : paymentMethod === 'upi' ? (
                <>
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <QrCode className="w-3 h-3 text-zinc-500" />
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Scan To Pay</p>
                  </div>
                  <div className="relative group/qr p-6 rounded-[40px] bg-[#f8fcfb] border border-white/20 shadow-[0_30px_60px_rgba(117,242,198,0.15)] mb-12 transition-all duration-700 hover:scale-[1.02]">
                    <QRCodeSVG
                      value={upiURI}
                      size={200}
                      level={"H"}
                      fgColor="#0a0a0c"
                      imageSettings={{
                        src: "https://img.icons8.com/fluency/96/security-checked--v1.png",
                        height: 34,
                        width: 34,
                        excavate: true,
                      }}
                    />

                    {/* Subtle Scanning Animation Line */}
                    <motion.div
                      animate={{ top: ['10%', '90%', '10%'] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-[#d4ff3f] to-transparent z-20 opacity-40 shadow-[0_0_8px_rgba(117,242,198,0.5)]"
                    />

                    {/* Corner Accents */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#d4ff3f]/20 rounded-tl-[40px]" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#d4ff3f]/20 rounded-br-[40px]" />
                  </div>

                  <div className="flex flex-col items-center gap-3 opacity-40 px-4">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#d4ff3f] shrink-0" />
                    <p className="text-[9px] leading-relaxed font-bold uppercase tracking-[0.15em] text-zinc-500 text-center">
                      <span className="text-zinc-400">SECURITY NOTICE:</span> ARCPAY IS A TECHNOLOGY TOOL FACILITATING DIRECT PAYMENTS.
                    </p>
                  </div>
                </>
              ) : paymentMethod === 'razorpay' ? (
                <>
                  <div className="flex flex-col items-center justify-center flex-1 py-12">
                    <div className="w-24 h-24 rounded-[32px] bg-[#0c0c0e] border border-white/[0.05] flex items-center justify-center mb-8 shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
                      <img src={razorpayLogo} alt="RazorPay" className="w-12 h-auto object-contain" />
                    </div>
                    <h4 className="text-2xl text-white mb-4">RazorPay Gateway</h4>
                    <p className="text-zinc-500 text-[10px] font-bold text-center max-w-[220px] leading-relaxed tracking-wider">
                      Instant payment via Secure Card, Netbanking or UPI through RazorPay.
                    </p>
                  </div>
                  <div className="w-full mt-auto">
                    <SlideToPay onComplete={handlePrimaryAction} />
                  </div>
                </>
              ) : null}
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col w-full max-w-[380px] pl-4"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-[1px] bg-[#d4ff3f]/30"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d4ff3f]/80">
              Payment Rules
            </span>
          </div>

          <div className="space-y-10">
            <div className="flex items-start gap-6 group/term">
              <ShieldCheck className="w-5 h-5 text-[#d4ff3f] shrink-0 mt-0.5 transition-transform duration-300 group-hover/term:scale-110" />
                <div className="col-span-8 text-white font-mono text-[10px] tracking-widest uppercase">
                  DIRECT PAYMENT: PAYMENTS ARE MADE DIRECTLY TO THE RECEIVER. ONCE LOGGED, DETAILS CANNOT BE CHANGED FOR SECURITY.
                </div>
            </div>

            <div className="flex items-start gap-6 group/term">
              <Clock className="w-5 h-5 text-[#d4ff3f] shrink-0 mt-0.5 transition-transform duration-300 group-hover/term:scale-110" />
                <div className="col-span-8 text-white font-mono text-[10px] tracking-widest uppercase">
                  VERIFICATION TIME: PAYMENTS ARE CHECKED AND VERIFIED WITHIN AN 8-12 HOUR TIME FRAME.
                </div>
            </div>

            <div className="flex items-start gap-6 group/term">
              <User className="w-5 h-5 text-[#d4ff3f] shrink-0 mt-0.5 transition-transform duration-300 group-hover/term:scale-110" />
                <div className="col-span-8 text-white font-mono text-[10px] tracking-widest uppercase">
                  NAME MATCH: MAKE SURE THE SENDER NAME MATCHES BANK RECORDS FOR QUICK SETUP AND SECURITY.
                </div>
            </div>

            <div className="flex items-start gap-6 group/term">
              <Info className="w-5 h-5 text-[#d4ff3f] shrink-0 mt-0.5 transition-transform duration-300 group-hover/term:scale-110" />
                <div className="col-span-8 text-white font-mono text-[10px] tracking-widest uppercase">
                  SYSTEM NOTICE: ARCPAY IS A TECHNOLOGY TOOL AND DOES NOT HOLD OR MANAGE YOUR MONEY DIRECTLY.
                </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [amount, setAmount] = useState('');
  const { showStatus } = useNotification();

  // Global Access Block Enforcer: Mount-time security check
  useEffect(() => {
    const checkSecurityStatus = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/public/settings`);
        const data = await response.json();
        
        if (data.isArcPayBlocked) {
          showStatus({
            type: 'error',
            title: 'ACCESS BLOCKED',
            message: 'Access to ArcPay has been Blocked'
          });
          // Small delay to ensure the status sheet is seen before redirect
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 100);
        }
      } catch (err) {
        console.error("Security sync failed");
      }
    };
    
    checkSecurityStatus();
  }, [navigate, showStatus]);

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
  const [name, setName] = useState(PAYEE_NAME);
  const [payerName, setPayerName] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [showAppChooser, setShowAppChooser] = useState(false);
  const [showSuccessSheet, setShowSuccessSheet] = useState(false);
  const [showSecurityAlert, setShowSecurityAlert] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [txId, setTxId] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showBankSheet, setShowBankSheet] = useState(false);
  const [alertType, setAlertType] = useState('tampered');
  const [isInspectionAlertOpen, setIsInspectionAlertOpen] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [payerEmail, setPayerEmail] = useState('');
  const [payerPhone, setPayerPhone] = useState('');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const handleBankConfirm = async (id, img) => {
    // Mark link as spent for security
    const settledInvoices = JSON.parse(localStorage.getItem('arcpay_settled_invoices') || '[]');
    if (invoiceId && !settledInvoices.includes(invoiceId)) {
      localStorage.setItem('arcpay_settled_invoices', JSON.stringify([...settledInvoices, invoiceId]));
    }

    // Update persistence status
    const searchParams = new URLSearchParams(window.location.search);
    const payId = searchParams.get('pay_id');
    if (payId) {
      const decoded = verifyPayload(payId);
      const targetId = decoded?.lid || payId; // Use LID if available, fallback to payId for older structures
      
      await fetch(`${BACKEND_URL}/api/links/settle/${targetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txId: id })
      }).catch(err => console.error("Settlement sync failed", err));
    }

    setTxId(id);
    setScreenshot(img);
    setShowBankSheet(false);
    setIsSubmitted(true);
    showStatus({ type: 'success', title: 'LOG SUCCESS', message: 'Transaction Logged Successfully' });
  };

  // Security Checks
  const searchParams = new URLSearchParams(location.search);
  const hasPayId = searchParams.has('pay_id');
  const sessionVerified = sessionStorage.getItem('merchant_verified') === 'true';

  // Strict Input Sanitization Handlers
  const handleAmountChange = (val) => {
    if (val === '' || /^\d*\.?\d{0,2}$/.test(val)) setAmount(val);
  };
  const handleNoteChange = (val) => {
    if (val.length <= 50) setNote(val.replace(/[<>]/g, ''));
  };
  const handleNameChange = (val) => {
    if (/^[a-zA-Z\s.]*$/.test(val) && val.length <= 30) setName(val);
  };
  const handlePayerNameChange = (val) => {
    if (/^[a-zA-Z\s.]*$/.test(val) && val.length <= 30) setPayerName(val);
  };

  // Session Security: Handle auto-expiry
  useEffect(() => {
    const sessionStart = sessionStorage.getItem('merchant_session_start');
    if (sessionVerified && !sessionStart) {
      sessionStorage.setItem('merchant_session_start', Date.now().toString());
    }

    const checkExpiry = setInterval(() => {
      const start = sessionStorage.getItem('merchant_session_start');
      if (start && Date.now() - parseInt(start) > 30 * 60 * 1000) { // 30 mins
        sessionStorage.clear();
        navigate('/', { replace: true });
        showStatus({ type: 'error', title: 'SESSION EXPIRED', message: 'Session Expired for Security' });
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkExpiry);
  }, [sessionVerified, navigate]);

  // UX Optimization: Scroll to top when payment is success to show full success screen
  useEffect(() => {
    if (isSubmitted) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isSubmitted]);

  if (!hasPayId && !sessionVerified) {
    return null;
  }

  // Global UI Lockdown & Integrity Monitor
  useEffect(() => {
    const preventAction = (e) => {
      e.preventDefault();
      setIsInspectionAlertOpen(true);
    };

    const handleKeydown = (e) => {
      if (
        e.keyCode === 123 || // F12
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) || // Ctrl+Shift+I/J/C
        (e.ctrlKey && e.keyCode === 85) // Ctrl+U
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

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const payId = searchParams.get('pay_id');

    if (payId) {
      const decoded = verifyPayload(payId);
      if (decoded) {
        // Check if this specific link/invoice has already been settled
        const settledInvoices = JSON.parse(localStorage.getItem('arcpay_settled_invoices') || '[]');
        if (decoded.iid && settledInvoices.includes(decoded.iid)) {
          setAlertType('settled');
          setShowSecurityAlert(true);
          return;
        }

        // Check database for real-time status (Invalidation support)
        if (decoded.lid) {
          fetch(`${BACKEND_URL}/api/links/${decoded.lid}/verify`)
            .then(res => res.json())
            .then(data => {
              if (data.status === 'INVALID') {
                setAlertType('tampered');
                setShowSecurityAlert(true);
              } else if (data.status === 'SETTLED') {
                setAlertType('settled');
                setShowSecurityAlert(true);
              } else if (data.status === 'SUBMITTED') {
                setAlertType('verifying');
                setShowSecurityAlert(true);
              } else {
                setShowSecurityAlert(false); // SAFETY: Explicitly hide alert if revalidated
              }
            })
            .catch(err => console.error("Persistence check failed", err));
        }

        if (decoded.a) setAmount(decoded.a);
        if (decoded.n) setNote(decoded.n);
        if (decoded.nm) setName(decoded.nm);
        if (decoded.p) setPayerName(decoded.p);
        if (decoded.iid) setInvoiceId(decoded.iid);
        if (decoded.m) setPaymentMethod(decoded.m);
        setIsLocked(true);
      } else {
        setShowSecurityAlert(true);
        setTimeout(() => navigate('/', { replace: true }), 5000);
      }
    }
  }, [navigate]);

  const generateUPIParams = () => {
    const validAmount = amount && !isNaN(Number(amount)) && Number(amount) > 0 ? Number(amount).toFixed(2) : '';
    if (!validAmount) return '';

    // Barebones Intent: 
    // Stripped all non-essential tags (mode, mc, tn) to mimic manual VPA entry as closely as possible.
    // This bypasses many 'Intent' specific limits that banks apply to commercial-looking links.
    return `pa=${PAYEE_VPA}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${validAmount}&cu=INR`;
  };

  const generateUPIURI = () => {
    const params = generateUPIParams();
    return params ? `upi://pay?${params}` : '';
  };

  const upiURI = generateUPIURI();
  const upiParams = generateUPIParams();
  const isValid = (paymentMethod === 'razorpay' ? Number(amount) > 0 : Boolean(upiURI)) && note.trim() !== '' && name.trim() !== '' && payerName.trim() !== '';

  const handleRazorpayPayment = async () => {
    if (!window.Razorpay) {
      showStatus({ 
        type: 'error', 
        title: 'GATEWAY OFFLINE', 
        message: "Razorpay secure verification failed. Check your network." 
      });
      return;
    }

    setIsCreatingOrder(true);
    showStatus({ 
      type: 'loading', 
      title: 'ORDER INITIATION', 
      message: "Securing transaction with encrypted gateway..." 
    });

    try {
      // Step 1: Create Secure Order via Railway Backend
      const orderResponse = await fetch(`${BACKEND_URL}/api/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Number(amount),
          currency: "INR",
          receipt: invoiceId,
          notes: {
            app_name: "ArcPay",
            invoice_id: invoiceId,
            sender_name: payerName,
            payer_email: payerEmail,
            payer_phone: payerPhone,
            payment_note: note
          }
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('Could not initialize secure gateway order');
      }

      const orderData = await orderResponse.json();

      if (!orderData.success || !orderData.order_id) {
        throw new Error('Invalid order response from gateway');
      }

      const options = {
        key: RAZORPAY_KEY,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.order_id, // CRITICAL: This enables instant capture
        name: name || "ArcPay",
        description: note || "Professional Payment Settlement",
        image: razorpayPopupLogo,
        handler: async function (response) {
          // Mark link as spent for security
          const settledInvoices = JSON.parse(localStorage.getItem('arcpay_settled_invoices') || '[]');
          if (invoiceId && !settledInvoices.includes(invoiceId)) {
            localStorage.setItem('arcpay_settled_invoices', JSON.stringify([...settledInvoices, invoiceId]));
          }

          const searchParams = new URLSearchParams(window.location.search);
          const payId = searchParams.get('pay_id');
          const decoded = payId ? verifyPayload(payId) : null;
          const targetId = decoded?.lid || payId;

          setTxId(response.razorpay_payment_id || response.razorpay_order_id);
          // Update persistence status
          if (targetId) {
            await fetch(`${BACKEND_URL}/api/links/settle/${targetId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ txId: response.razorpay_payment_id })
            });
          }

          setIsSubmitted(true);
        },
        prefill: {
          name: payerName,
          email: payerEmail,
          contact: payerPhone,
        },
        notes: {
          invoice_id: invoiceId,
          payment_note: note,
          sender_name: payerName,
          app_name: "ArcPay"
        },
        theme: {
          color: "#000000",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response) {
        showStatus({ 
          type: 'error', 
          title: 'PAYMENT FAILURE', 
          message: response.error.description 
        });
      });
      rzp1.open();
    } catch (err) {
      console.error('Order Creation Error:', err);
      showStatus({ 
        type: 'error', 
        title: 'SECURITY VIOLATION', 
        message: err.message || "Failed to secure transaction" 
      });
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handlePrimaryAction = () => {
    if (!isValid) return;

    if (isLocked) {
      if (paymentMethod === 'bank') {
        setShowBankSheet(true);
      } else if (paymentMethod === 'razorpay') {
        // Mandatory validation for Razorpay
        if (!payerEmail || !payerPhone) {
          setAlertType('missing');
          setShowSecurityAlert(true);
          return;
        }
        handleRazorpayPayment();
      } else {
        setShowAppChooser(true);
      }
    } else {
      const newInvoiceId = `AP-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const newLinkId = Math.random().toString(36).substring(2, 15);
      setInvoiceId(newInvoiceId);

      const payload = signPayload({ a: amount, n: note, nm: name, p: payerName, iid: newInvoiceId, m: paymentMethod, lid: newLinkId });
      const baseUrl = window.location.origin + window.location.pathname;
      const shareableUrl = `${baseUrl}?pay_id=${payload}`;

      setGeneratedLink(shareableUrl);
      copyToClipboard(shareableUrl);

      // Register link for Dashboard tracking
      fetch(`${BACKEND_URL}/api/links/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkId: newLinkId,
          amount: Number(amount),
          name: name,
          payerName: payerName,
          note: note,
          invoiceId: newInvoiceId,
          paymentMethod: paymentMethod,
          fullUrl: shareableUrl // Send the signed payload URL for storage
        })
      }).catch(err => console.error("Link tracking failed", err));

      // Mobile Success Sheet vs Desktop Toast
      if (window.innerWidth < 1024) {
        setShowSuccessSheet(true);
      } else {
        showStatus({ 
          type: 'success', 
          title: 'LINK GENERATED', 
          message: "Secure payment terminal hash copied to your clipboard." 
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
    <div className="min-h-screen bg-black p-0 sm:p-4 md:p-6 lg:p-8 font-sans antialiased text-white selection:bg-[#d4ff3f]/30">
      <SEO
        title={isLocked ? `Pay ₹${new Intl.NumberFormat('en-IN').format(Number(amount))} to ${name || PAYEE_NAME}` : "Create Professional Payment Link"}
        description={isLocked ? `Securely complete your payment of ₹${new Intl.NumberFormat('en-IN').format(Number(amount))} to ${name || PAYEE_NAME} via ArcPay instant settlement.` : undefined}
      />
      <div className="max-w-[1400px] mx-auto rounded-none sm:rounded-[40px] overflow-hidden shadow-2xl relative min-h-screen sm:min-h-[90vh] bg-[#0a0a0c] px-4 sm:px-8 pt-6 pb-10">
        {isSubmitted ? (
          <div className="max-w-[1240px] mx-auto min-h-[80vh] flex items-center justify-center">
            <SuccessState
              amount={amount} name={name || PAYEE_NAME} txId={txId}
              method={paymentMethod} invoiceId={invoiceId} note={note}
              payerName={payerName} payerEmail={payerEmail} payerPhone={payerPhone}
            />
          </div>
        ) : (
          <>
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

            <div className="max-w-[1240px] mx-auto relative z-10">
              {isLocked ? (
                <PayerView
                  amount={amount} note={note} name={name} payerName={payerName}
                  invoiceId={invoiceId} paymentMethod={paymentMethod} upiURI={upiURI}
                  handlePrimaryAction={handlePrimaryAction} PAYEE_NAME={PAYEE_NAME}
                  DEFAULT_BANK_DETAILS={DEFAULT_BANK_DETAILS} arcbyteLogo={arcbyteLogo}
                  payerEmail={payerEmail} setPayerEmail={setPayerEmail}
                  payerPhone={payerPhone} setPayerPhone={setPayerPhone}
                />
              ) : (
                <CreatorView
                  paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
                  amount={amount} setAmount={setAmount}
                  name={name} handleNameChange={handleNameChange}
                  payerName={payerName} handlePayerNameChange={handlePayerNameChange}
                  note={note} handleNoteChange={handleNoteChange}
                  isValid={isValid} handlePrimaryAction={handlePrimaryAction}
                  handleDownloadQR={handleDownloadQR} arcbyteLogo={arcbyteLogo}
                />
              )}
            </div>

            {/* Footer */}
            <footer className="mt-20 pt-16 pb-0 border-t border-white/[0.03] max-w-[1240px] mx-auto w-full">
              <div className="flex flex-col md:flex-row items-center justify-between gap-y-10 gap-x-8 mb-12">
                <div className="flex items-center justify-center md:justify-start gap-2.5 opacity-60 hover:opacity-100 transition-opacity">
                  <ShieldCheck className="w-5 h-5 text-zinc-400 stroke-[2.5]" />
                  <span className="text-lg font-bold tracking-tight text-white">ArcPay</span>
                  <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
                  <img src={arcbyteLogo} alt="ArcByte" className="h-5 opacity-90 object-contain" />
                </div>

                <div className="flex flex-nowrap items-center justify-center md:justify-end gap-x-3.5 sm:gap-x-8">
                  {['Investors', 'Security', 'Features', 'Documentation'].map((item) => (
                    <a
                      key={item}
                      href="https://arcbyte.co"
                      className="text-zinc-500 text-[8.5px] sm:text-[10px] font-bold uppercase tracking-[0.05em] sm:tracking-widest hover:text-[#d4ff3f] transition-colors whitespace-nowrap"
                    >
                      {item}
                    </a>
                  ))}
                </div>
              </div>
            </footer>
          </>
        )}

        <AppChooser isOpen={showAppChooser} onClose={() => setShowAppChooser(false)} upiParams={upiParams} />
        <LinkGeneratedSheet isOpen={showSuccessSheet} onClose={() => setShowSuccessSheet(false)} link={generatedLink} />
        <ComingSoonSheet isOpen={showHelp} onClose={() => setShowHelp(false)} />
        <InspectionRestrictedSheet isOpen={isInspectionAlertOpen} onClose={() => setIsInspectionAlertOpen(false)} />
        <BankConfirmationSheet
          isOpen={showBankSheet}
          onClose={() => setShowBankSheet(false)}
          onConfirm={handleBankConfirm}
          amount={amount}
          setAmount={setAmount}
          name={name}
          payerName={payerName}
          setPayerName={setPayerName}
          note={note}
          setNote={setNote}
        />
        <AppChooser isOpen={showAppChooser} onClose={() => setShowAppChooser(false)} upiParams={upiParams} />
        <LinkGeneratedSheet isOpen={showSuccessSheet} onClose={() => setShowSuccessSheet(false)} link={generatedLink} />
        <ComingSoonSheet isOpen={showHelp} onClose={() => setShowHelp(false)} />
        <InspectionRestrictedSheet isOpen={isInspectionAlertOpen} onClose={() => setIsInspectionAlertOpen(false)} />
        <BankConfirmationSheet
          isOpen={showBankSheet}
          onClose={() => setShowBankSheet(false)}
          onConfirm={handleBankConfirm}
          amount={amount}
          setAmount={setAmount}
          name={name}
          payerName={payerName}
          setPayerName={setPayerName}
          note={note}
          setNote={setNote}
        />
        <SecurityAlertSheet
          isOpen={showSecurityAlert}
          onClose={() => {
            setShowSecurityAlert(false);
            if (alertType !== 'missing') {
              navigate('/', { replace: true });
            }
          }}
          type={alertType}
          amount={amount}
          name={name || PAYEE_NAME}
          txId={txId}
          method={paymentMethod}
          invoiceId={invoiceId}
          note={note}
          payerName={payerName}
          payerEmail={payerEmail}
          payerPhone={payerPhone}
        />

        {/* Global Hidden Invoice Template for Capture */}
        <div className="fixed -left-[1000px] top-0 opacity-0 pointer-events-none">
          <InvoiceTemplate
            amount={amount} name={name || PAYEE_NAME} txId={txId}
            method={paymentMethod} invoiceId={invoiceId} note={note}
            payerName={payerName} payerEmail={payerEmail} payerPhone={payerPhone}
          />
        </div>
      </div>
    </div>
  );
}
