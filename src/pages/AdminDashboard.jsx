import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, LogOut, ExternalLink,
  Copy, Trash2, AlertTriangle,
  CheckCircle2, Clock, Ban,
  TrendingUp, Wallet, Link as LinkIcon,
  RefreshCcw, Search, Filter, Check,
  Home, Users, Settings, HelpCircle,
  ChevronRight, MoreHorizontal, MessageSquare,
  Smartphone, CreditCard, Landmark, Mail,
  LayoutGrid, X, Zap, Lock, Terminal
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../context/NotificationContext';
import arcbyteLogo from '../assets/arcbyte_logo_white_transparent.png';
import upiLogo from '../assets/upi.png';
import bankLogo from '../assets/Federal_bank_India.svg.png';
import razorpayLogo from '../assets/razorpay_logo.png';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const StatLine = ({ color, dashed = false, data = [], selectedDate = null }) => {
  if (!data || data.length === 0) return null;

  // Normalize data points to fit a 1000x100 coordinate system
  const maxVal = Math.max(...data.map(d => d.revenue), 1000); // at least 1000 for scale
  const points = data.map((val, i) => ({
    x: (i / (data.length - 1)) * 1000,
    y: 100 - (val.revenue / maxVal) * 80, // Leave 20 units for top padding
    dateStr: val.date
  }));

  // Find selection index
  const selectedIndex = selectedDate ? points.findIndex(p => p.dateStr === selectedDate) : -1;
  const selectedPoint = selectedIndex !== -1 ? points[selectedIndex] : null;

  // Generate a smooth quadratic bezier path string
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cpX = (p0.x + p1.x) / 2;
    path += ` Q ${cpX} ${p0.y}, ${p1.x} ${p1.y}`;
  }

  const fillPath = `${path} V 100 H 0 Z`;

  return (
    <svg viewBox="0 0 1000 100" className="absolute inset-x-0 bottom-12 w-full h-32 opacity-60 overflow-visible" preserveAspectRatio="none">
      {/* SHADOW LINE FOR SELECTION */}
      <AnimatePresence>
        {selectedPoint && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.line
              x1={selectedPoint.x}
              y1={0}
              x2={selectedPoint.x}
              y2={100}
              stroke={color}
              strokeWidth="1"
              strokeDasharray="4,4"
              opacity={0.3}
            />
            <motion.circle
              cx={selectedPoint.x}
              cy={selectedPoint.y}
              r={4}
              fill={color}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10 }}
            />
          </motion.g>
        )}
      </AnimatePresence>

      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeDasharray={dashed ? "5,5" : "none"}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
      <motion.path
        d={fillPath}
        fill={`url(#gradient-${color.replace('#', '')})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
      />
      <defs>
        <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default function AdminDashboard() {
  const [links, setLinks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [stats, setStats] = useState({
    totalLinks: 0,
    totalRevenue: 0,
    pendingCount: 0,
    settledCount: 0,
    dailyStats: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('home');
  const navigate = useNavigate();
  const { showStatus } = useNotification();
  const merchantName = localStorage.getItem('arcpay_merchant') || 'Merchant';
  const [maintenanceSettings, setMaintenanceSettings] = useState({
    isMaintenanceMode: false,
    maintenanceEndTime: '',
    maintenanceMessage: '',
    isArcPayBlocked: false,
    requirePasscode: true,
    passcode: ''
  });

  const [auth2FA, setAuth2FA] = useState({
    isEnabled: false,
    isSettingUp: false,
    qrCode: null,
    secret: null,
    code: ''
  });

  const [gatewayConfig, setGatewayConfig] = useState({
    razorpayApiKey: '',
    razorpayApiSecret: ''
  });

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('arcpay_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    try {
      const [statsRes, linksRes, faRes, gateRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/admin/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${BACKEND_URL}/api/admin/links`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${BACKEND_URL}/api/admin/2fa/status`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${BACKEND_URL}/api/admin/gateway`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (statsRes.status === 401 || linksRes.status === 401) {
        localStorage.removeItem('arcpay_token');
        navigate('/admin/login');
        return;
      }

      const statsData = await statsRes.json();
      const linksData = await linksRes.json();
      const faData = await faRes.json();
      const gateData = await gateRes.json();

      setStats(statsData);
      setLinks(linksData);
      if (faRes.ok) {
        setAuth2FA(prev => ({ ...prev, isEnabled: faData.isTwoFactorEnabled }));
      }
      if (gateRes.ok) {
        setGatewayConfig({
           razorpayApiKey: gateData.razorpayApiKey || '',
           razorpayApiSecret: gateData.razorpayApiSecret || ''
        });
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      showStatus({
        type: 'error',
        title: 'SYSTEM ERROR',
        message: "Unable to connect to the secure server. Please check your internet connection."
      });
    } finally {
      setIsLoading(false);
    }

    // Fetch maintenance settings
    try {
      const response = await fetch(`${BACKEND_URL}/api/public/settings`);
      const data = await response.json();
      setMaintenanceSettings({
        ...data,
        isArcPayBlocked: data.isArcPayBlocked || false,
        maintenanceEndTime: data.maintenanceEndTime ? new Date(data.maintenanceEndTime).toISOString().slice(0, 16) : '',
        passcode: '' // Don't show the existing passcode for security
      });
    } catch (err) {
      console.error("Failed to fetch settings");
    }
  };

  // --- ZERO-TRUST FRONTEND SECURITY INJECTION ---
  useEffect(() => {
    // 1. Source Code & Inspection Blackout Hook
    const restrictInspection = (e) => {
      // Block F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      // Block Ctrl+Shift+I / Cmd+Option+I (Element Examiner)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
        e.preventDefault();
        return false;
      }
      // Block Ctrl+Shift+J / Cmd+Option+J (Console Layer)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
        e.preventDefault();
        return false;
      }
      // Block Ctrl+U / Cmd+U (View Source Code Drop)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        return false;
      }
    };

    const restrictContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    window.addEventListener('keydown', restrictInspection);
    window.addEventListener('contextmenu', restrictContextMenu);

    return () => {
      window.removeEventListener('keydown', restrictInspection);
      window.removeEventListener('contextmenu', restrictContextMenu);
    };
  }, []);

  useEffect(() => {
    // 2. Dead Man's Switch - 15 Minute Global Idle Auto-Logout
    let idleTimeout;

    const shredSession = () => {
      console.warn("SECURITY OVERRIDE: Terminal Idle Exceeded. Erasing Session State.");
      localStorage.removeItem('arcpay_token');
      localStorage.removeItem('arcpay_merchant');
      navigate('/admin/login', { replace: true });
    };

    const resetIdleTimer = () => {
      if (idleTimeout) clearTimeout(idleTimeout);
      // Construct 15 minute strict destruction window (900000 ms)
      idleTimeout = setTimeout(shredSession, 900000);
    };

    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('keydown', resetIdleTimer);
    window.addEventListener('scroll', resetIdleTimer);

    // Initial sequence kickoff
    resetIdleTimer();

    return () => {
      if (idleTimeout) clearTimeout(idleTimeout);
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('keydown', resetIdleTimer);
      window.removeEventListener('scroll', resetIdleTimer);
    };
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    const token = localStorage.getItem('arcpay_token');
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/links/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setStats(prev => ({
          ...prev,
          dailyStats: prev.dailyStats.map(d =>
            d.date === selectedDate ? { ...d, count: d.count + (newStatus === 'SETTLED' ? 0.0000001 : 0) } : d // Force chart refresh if needed
          )
        }));
        showStatus({
          type: 'success',
          title: 'PAYMENT UPDATED',
          message: `Transaction verified. Status set to ${newStatus.toLowerCase()}.`
        });
        fetchDashboardData();
      } else {
        showStatus({
          type: 'error',
          title: 'ERROR',
          message: "The update could not be completed at this time."
        });
      }
    } catch (err) {
      showStatus({
        type: 'error',
        title: 'CONNECTION ERROR',
        message: "The server is currently unreachable."
      });
    }
  };

  const handleGatewayUpdate = async () => {
    const token = localStorage.getItem('arcpay_token');
    try {
      showStatus({ type: 'info', title: 'SYNCHRONIZING', message: 'Pushing gateway configurations to secure endpoints...' });
      const response = await fetch(`${BACKEND_URL}/api/admin/gateway`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(gatewayConfig)
      });
      const data = await response.json();
      
      if (response.ok) {
        showStatus({ type: 'success', title: 'GATEWAY BOUND', message: 'API Keys updated. Node automatically securely reloaded.' });
        fetchDashboardData();
      } else {
        showStatus({ type: 'error', title: 'ERROR', message: data.error || 'Failed to update protocol keys.' });
      }
    } catch (err) {
      showStatus({ type: 'error', title: 'CONNECTION ERROR', message: 'Server proxy failed to catch update.' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('arcpay_token');
    navigate('/admin/login');
  };

  const handleGenerate2FA = async () => {
    setAuth2FA(prev => ({ ...prev, isSettingUp: true }));
    const token = localStorage.getItem('arcpay_token');
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/2fa/generate`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAuth2FA(prev => ({ ...prev, qrCode: data.qrCode, secret: data.secret }));
      }
    } catch(err) {
      showStatus({ type: 'error', title: 'SECURITY ERROR', message: 'Failed to generate cryptographic key.' });
    }
  };

  const handleEnable2FA = async () => {
    const token = localStorage.getItem('arcpay_token');
    if (auth2FA.code.length !== 6) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/2fa/enable`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: auth2FA.code, secret: auth2FA.secret })
      });
      const data = await res.json();
      if (data.success) {
        setAuth2FA({ isEnabled: true, isSettingUp: false, qrCode: null, secret: null, code: '' });
        showStatus({ type: 'success', title: '2FA ENABLED', message: 'Security module permanently locked.' });
      } else {
        showStatus({ type: 'error', title: 'CODE REJECTED', message: data.error || 'Algorithmic mismatch' });
      }
    } catch(err) {
      showStatus({ type: 'error', title: 'VERIFICATION ERROR', message: 'Unable to communicate with authentication node.' });
    }
  };

  const handleDisable2FA = async () => {
    const token = localStorage.getItem('arcpay_token');
    if (auth2FA.code.length !== 6) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/2fa/disable`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: auth2FA.code })
      });
      const data = await res.json();
      if (data.success) {
        setAuth2FA(prev => ({ ...prev, isEnabled: false, code: '' }));
        showStatus({ type: 'success', title: '2FA DISABLED', message: 'Security downgrade complete.' });
      } else {
        showStatus({ type: 'error', title: 'UNAUTHORIZED', message: data.error || 'Invalid attempt' });
      }
    } catch(err) {
      showStatus({ type: 'error', title: 'SYSTEM ERROR', message: 'Unable to release security lock.' });
    }
  };

  const filteredLinks = links.filter(link => {
    const matchesSearch =
      link.linkId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (link.payerName && link.payerName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || link.status === statusFilter;
    const matchesMethod = methodFilter === 'ALL' || link.paymentMethod === methodFilter;

    if (!selectedDate) return matchesSearch && matchesStatus && matchesMethod;

    const linkDate = new Date(link.createdAt).toISOString().split('T')[0];
    return matchesSearch && matchesStatus && matchesMethod && linkDate === selectedDate;
  });

  // Dynamic 14-day scroller generation
  const today = new Date();
  const dynamicDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (13 - i));
    const isToday = d.toDateString() === today.toDateString();
    return {
      num: d.getDate().toString().padStart(2, '0'),
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateStr: d.toISOString().split('T')[0],
      active: isToday
    };
  });

  return (
    <div className="admin-dashboard-root flex h-screen bg-[#050505] text-[#e0e0e0] font-sans selection:bg-[#d4ff3f]/30 overflow-hidden">
      {/* NIXIO SIDEBAR */}
      <aside className="w-[100px] flex flex-col items-center py-10 border-r border-[#ffffff0a] bg-[#0a0a0c] z-50">
        <div className="mb-16">
          <ShieldCheck className="w-8 h-8 text-[#d4ff3f]" strokeWidth={2.5} />
        </div>

        <nav className="flex flex-col gap-10 flex-1">
          {[
            { id: 'home', icon: Home },
            { id: 'security', icon: ShieldCheck },
            { id: 'api', icon: Terminal },
            { id: 'links', icon: LinkIcon },
            { id: 'stats', icon: TrendingUp },
            { id: 'users', icon: Users },
            { id: 'payments', icon: Wallet },
            { id: 'settings', icon: Settings },
            { id: 'chats', icon: MessageSquare, count: 4 },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative p-3 rounded-2xl transition-all group ${activeTab === item.id ? 'text-[#d4ff3f]' : 'text-zinc-600 hover:text-zinc-400'}`}
            >
              <item.icon className="w-6 h-6" />
              {item.count && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#d4ff3f] text-black text-[10px] font-black rounded-full flex items-center justify-center border-4 border-[#0a0a0c]">
                  {item.count}
                </span>
              )}
              {activeTab === item.id && (
                <motion.div layoutId="active-pill" className="absolute inset-0 bg-[#d4ff3f]/10 rounded-2xl -z-10" />
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-8">
          <button onClick={handleLogout} className="text-zinc-600 hover:text-red-500 transition-colors">
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </aside>

      {/* MAIN PANEL */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* NIXIO TOPBAR */}
        <header className="h-[100px] flex items-center justify-between px-10 border-b border-[#ffffff0a]">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black tracking-tighter text-white">ArcPay</span>
              <div className="w-[1px] h-6 bg-white/10" />
              <img src={arcbyteLogo} alt="ArcByte" className="h-6 opacity-80" />
            </div>

            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[#d4ff3f] transition-colors" />
              <input
                type="text"
                placeholder="Find payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#16161a] h-12 rounded-2xl pl-12 pr-6 text-sm font-bold w-[260px] outline-none border border-transparent focus:border-[#d4ff3f]/30 transition-all placeholder:text-zinc-700"
              />
            </div>

            <div className="flex items-center gap-2 bg-[#16161a] p-1.5 rounded-2xl border border-white/5">
              {['ALL', 'PENDING', 'SETTLED', 'INVALID'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s === 'INVALID' ? 'INVALIDATED' : s)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                    (statusFilter === s || (s === 'INVALID' && statusFilter === 'INVALIDATED'))
                      ? "bg-[#d4ff3f] text-black shadow-[0_0_15px_#d4ff3f50]"
                      : "text-zinc-600 hover:text-zinc-400"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-10">
            <div className="flex -space-x-4 group/avatars">
              {[1, 2, 3].map(i => (
                <div key={i} className={`w-10 h-10 rounded-full border-2 border-[#050505] bg-zinc-900 flex items-center justify-center relative transition-all duration-500 hover:z-10 hover:-translate-y-1 cursor-default ${i === 3 ? 'shadow-[0_0_20px_rgba(212,255,63,0.1)]' : ''}`}>
                  <span className="text-[10px] font-black text-zinc-600 group-hover/avatars:text-white transition-colors">+9</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-4 h-4 bg-[#d4ff3f]/20 rounded-full blur-md animate-pulse" />
                  <div className="w-1.5 h-1.5 bg-[#d4ff3f] relative z-10" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-white leading-none">{stats.settledCount.toString().padStart(2, '0')}</span>
                  <span className="text-[8px] font-black text-[#d4ff3f] uppercase tracking-[0.3em] mt-1">Settled</span>
                </div>
              </div>

              <div className="w-[1px] h-6 bg-white/5" />

              <div className="flex flex-col">
                <span className="text-sm font-black text-zinc-200 leading-none">{stats.pendingCount.toString().padStart(2, '0')}</span>
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em] mt-1">Unsettled</span>
              </div>
            </div>

            <div className="flex items-center gap-5 ml-4 pl-10 border-l border-white/5">
              <div className="text-right flex flex-col items-end">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-black text-white uppercase tracking-wider">{merchantName}</span>
                  <img src={arcbyteLogo} alt="ArcByte" className="h-3 opacity-90" />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <div className="w-1 h-1 bg-[#d4ff3f] rounded-full shadow-[0_0_5px_#d4ff3f]" />
                  <p className="text-[9px] font-black text-[#d4ff3f] uppercase tracking-[0.4em] opacity-80">Admin Console</p>
                </div>
              </div>
              <div className="relative group/user">
                <div className="absolute inset-0 bg-[#d4ff3f]/10 blur-xl rounded-full opacity-0 group-hover/user:opacity-100 transition-opacity" />
                <div className="w-11 h-11 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/5 relative z-10 hover:border-[#d4ff3f]/30 transition-all cursor-pointer">
                  <Users className="w-5 h-5 text-zinc-500 group-hover/user:text-[#d4ff3f] transition-colors" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* FEED CONTENT */}
        <section className={cn(
          "flex-1 overflow-y-auto custom-scrollbar relative",
          activeTab !== 'chats' && "p-10"
        )}>
          {activeTab === 'api' && (
            <div className="space-y-12 pb-20">
              {/* EDITORIAL HEADER */}
              <div className="relative">
                <div className="absolute -left-20 -top-20 w-[400px] h-[400px] bg-[#d4ff3f]/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="relative z-10">
                  <p className="text-[#d4ff3f] text-[10px] font-black uppercase tracking-[0.5em] mb-4 flex items-center gap-4">
                    <span className="w-8 h-[1px] bg-[#d4ff3f]/30"></span>
                    Gateway Protocol 1.0
                  </p>
                  <h2 className="text-[clamp(1.5rem,6vw,3.5rem)] italic font-black uppercase tracking-tighter leading-[0.95] text-white">
                    API<br />
                    <span className="text-[#d4ff3f] drop-shadow-[0_0_20px_rgba(212,255,63,0.2)]">NODE</span>
                  </h2>
                </div>
              </div>

              {/* PERFECTED EDITORIAL SPREAD */}
              <div className="relative border-t border-white/[0.08] pt-12">
                <div className="absolute top-0 right-0 w-32 h-[1px] bg-[#d4ff3f]/40" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-0">
                  {/* SEGMENT I: RAZORPAY GATEWAY */}
                  <div className="lg:pr-16 relative">
                    <div className="flex flex-col h-full">
                      <div className="flex items-center gap-4 mb-16">
                        <div className="w-1.5 h-1.5 bg-[#d4ff3f] shadow-[0_0_10px_rgba(212,255,63,0.5)]" />
                        <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Payment Gateway Connection</h4>
                      </div>

                      <div className="space-y-6">
                        <h3 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none">Razorpay<br />Binding</h3>
                        <p className="text-zinc-600 text-[11px] font-bold uppercase tracking-widest leading-relaxed max-w-xs">
                          Inject your target Razorpay API credentials here to hot-reload the backend processing node.
                        </p>
                      </div>

                      <div className="mt-16 space-y-12">
                        {/* API KEY */}
                        <div className="relative group">
                          <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em] block mb-4">REST API Key ID</label>
                          <input
                            type="text"
                            placeholder="rzp_live_••••••"
                            value={gatewayConfig.razorpayApiKey}
                            onChange={(e) => setGatewayConfig(prev => ({ ...prev, razorpayApiKey: e.target.value }))}
                            className="w-full bg-transparent border-b-2 border-white/[0.05] pb-6 text-white font-black text-2xl tracking-[0.1em] outline-none focus:border-[#d4ff3f] transition-all placeholder:text-[#111] selection:bg-[#d4ff3f]/50"
                          />
                        </div>

                        {/* API SECRET */}
                        <div className="relative group">
                           <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em] block mb-4">REST API Secret</label>
                          <input
                            type="password"
                            placeholder="Enter new secret to override..."
                            value={gatewayConfig.razorpayApiSecret}
                            onChange={(e) => setGatewayConfig(prev => ({ ...prev, razorpayApiSecret: e.target.value }))}
                            className="w-full bg-transparent border-b-2 border-white/[0.05] pb-6 text-white font-black text-2xl tracking-[0.1em] outline-none focus:border-[#d4ff3f] transition-all placeholder:text-[#111] selection:bg-[#d4ff3f]/50"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SEGMENT II: GATEWAY STATUS */}
                  <div className="lg:pl-16 relative">
                    <div className="hidden lg:block absolute -left-[0.5px] top-0 h-full w-[1px] bg-white/[0.05]" />
                    <div className="flex flex-col h-full">
                      <div className="flex items-center gap-4 mb-16">
                        <Terminal className="w-4 h-4 text-zinc-600" />
                        <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Node Diagnostic Output</h4>
                      </div>

                      <div className="space-y-6">
                        <h3 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none">Gateway<br />Status</h3>
                        <p className="text-zinc-600 text-[11px] font-bold uppercase tracking-widest leading-relaxed max-w-xs">
                          Current status of the Razorpay protocol proxy running on the backend securely.
                        </p>
                      </div>

                      <div className="mt-16 bg-[#0a0a0c] border border-white/5 p-8 rounded-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4ff3f]/20 to-transparent" />
                        {(gatewayConfig.razorpayApiKey && gatewayConfig.razorpayApiSecret) ? (
                          <div className="space-y-6">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-[#d4ff3f] animate-pulse shadow-[0_0_10px_#d4ff3f]" />
                              <span className="text-[10px] font-black text-[#d4ff3f] uppercase tracking-[0.3em]">Protocol Bound</span>
                            </div>
                            <p className="text-zinc-500 font-mono text-[10px] uppercase">Proxy layer established and awaiting incoming webhooks.</p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]" />
                              <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">Protocol Disabled</span>
                            </div>
                            <p className="text-zinc-500 font-mono text-[10px] uppercase">System is missing active Razorpay payloads. Awaiting binding.</p>
                          </div>
                        )}
                        <Terminal className="w-32 h-32 absolute -bottom-10 -right-10 opacity-5 text-[#d4ff3f]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTON LAYER */}
              <div className="pt-16 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="max-w-md">
                  <h4 className="text-[#d4ff3f] text-[9px] font-black uppercase tracking-[0.4em] mb-3">Sync Node</h4>
                  <p className="text-zinc-600 text-[10px] font-medium leading-relaxed uppercase tracking-widest">
                    Hot-reloads the backend with the written REST Keys without terminating the socket layer.
                  </p>
                </div>
                <button
                  onClick={handleGatewayUpdate}
                  className="w-full sm:w-auto flex items-center justify-center gap-4 px-12 py-5 bg-[#d4ff3f] text-black rounded-full font-black uppercase tracking-widest text-[11px] hover:shadow-[0_0_50px_rgba(212,255,63,0.3)] transition-all group active:scale-95"
                >
                  <Terminal className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Establish Protocol Binding
                </button>
              </div>
            </div>
          )}
          {activeTab === 'chats' && (
            <div className="absolute inset-0 w-full h-full bg-[#050505] z-10 animate-in fade-in duration-700">
              {/* Editorial Loading State */}
              <div className="absolute inset-0 flex items-center justify-center -z-10 bg-[#050505]">
                <div className="flex flex-col items-center gap-6">
                  <div className="w-12 h-12 rounded-full border-b-2 border-[#d4ff3f] animate-spin" />
                  <p className="text-[#d4ff3f] text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Initialising secure mail...</p>
                </div>
              </div>
              <iframe
                src="https://mail.arcbyte.co"
                className="w-full h-full border-none opacity-0 transition-opacity duration-1000"
                onLoad={(e) => e.target.style.opacity = '1'}
                title="ArcMail Console"
              />
            </div>
          )}
          {activeTab === 'home' && (
            <div className="flex gap-10">
              {/* LEFT COLUMN: STATS & LIST */}
              <div className="flex-1 space-y-12">
                {/* STATISTICS SECTION */}
                <div className="space-y-8">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-[1px] bg-[#d4ff3f]/40" />
                        <span className="text-[10px] font-black text-[#d4ff3f] uppercase tracking-[0.4em]">Integrated Security Firewall</span>
                      </div>
                      <h2 className="text-5xl font-black italic uppercase tracking-tighter text-[#d4ff3f]">
                        Dashboard
                      </h2>
                    </div>
                    <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest pb-2">
                      {['Days', 'Weeks', 'Months'].map(t => (
                        <button key={t} className={t === 'Days' ? 'text-white border-b-2 border-[#d4ff3f]' : 'text-zinc-600 hover:text-white transition-colors'}>{t}</button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#0a0a0c] rounded-[32px] border border-[#ffffff08] p-10 relative overflow-hidden h-[400px]">
                    {/* Date Scroller */}
                    <div className="flex gap-4 overflow-x-auto no-scrollbar mb-10 pb-4">
                      {dynamicDays.map((d, i) => {
                        const dayStats = stats.dailyStats?.find(s => s.date === d.dateStr);
                        const isSelected = selectedDate === d.dateStr;
                        return (
                          <div
                            key={i}
                            onClick={() => setSelectedDate(isSelected ? null : d.dateStr)}
                            className={`flex flex-col items-center justify-center min-w-[72px] h-[90px] rounded-2xl border transition-all duration-500 cursor-pointer ${isSelected ? 'bg-[#d4ff3f] border-[#d4ff3f] text-black shadow-[0_0_25px_rgba(212,255,63,0.2)]' : 'bg-[#16161a] border-white/5 text-zinc-500 hover:border-white/10'}`}
                          >
                            <span className="text-[11px] font-black uppercase mb-1">{d.num}</span>
                            <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest">{d.day}</span>
                            {dayStats?.revenue > 0 && (
                              <div className={`mt-2 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-black/20' : 'bg-[#d4ff3f]'}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Dynamic Chart Visual */}
                    <div className="relative h-48 w-full">
                      <StatLine color="#d4ff3f" data={stats.dailyStats} selectedDate={selectedDate} />
                      <StatLine color="#ffffff" dashed={true} data={stats.dailyStats?.map(d => ({ ...d, revenue: d.revenue * 0.8 }))} selectedDate={selectedDate} />

                      {/* Time markers */}
                      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
                        {['7 am', '8 am', '9 am', '10 am', '11 am', '12 am', '1 pm', '2 pm', '3 pm', '4 pm'].map(t => (
                          <span key={t} className="text-[8px] font-black text-zinc-700 uppercase">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ONGOING PAYMENTS SCROLLER */}
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-[1px] bg-[#d4ff3f]/40" />
                          <span className="text-[10px] font-black text-[#d4ff3f] uppercase tracking-[0.4em]">Settlement Feed</span>
                        </div>
                        <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">
                          Recent <span className="text-zinc-600">Payments</span>
                        </h2>
                      </div>
                      {selectedDate && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-[#d4ff3f]/10 border border-[#d4ff3f]/20 rounded-full">
                          <span className="text-[10px] font-black text-[#d4ff3f] uppercase tracking-widest">
                            {new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                          </span>
                          <button onClick={() => setSelectedDate(null)} className="text-[#d4ff3f]/60 hover:text-[#d4ff3f]">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {selectedDate && (
                        <button
                          onClick={() => setSelectedDate(null)}
                          className="text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors"
                        >
                          Show All
                        </button>
                      )}
                      <button onClick={fetchDashboardData} className="p-3 bg-white/5 rounded-2xl text-zinc-500 hover:text-[#d4ff3f] transition-colors">
                        <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 pb-20">
                    {filteredLinks.slice(0, 8).map((link, i) => (
                      <motion.div
                        key={link._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group relative flex items-center justify-between py-10 px-6 border-b border-white/[0.03] hover:bg-white/[0.02] transition-all duration-500 rounded-[24px] cursor-default"
                      >
                        {/* Left: Identity & Primary Info */}
                        <div className="flex items-center gap-10 w-[45%] min-w-[400px]">
                          <div className="relative shrink-0">
                            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center border border-white/5 text-xl font-black text-[#d4ff3f] shadow-2xl transition-transform group-hover:scale-110 duration-500">
                              {(link.payerName || link.name || "AC").charAt(0)}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-black ${link.status === 'SETTLED' ? 'bg-[#d4ff3f]' :
                                link.status === 'SUBMITTED' ? 'bg-[#d4ff3f] animate-pulse' :
                                  'bg-zinc-800'
                              }`} />
                          </div>

                          <div className="flex flex-col gap-2 min-w-0">
                            <h3 className="text-2xl text-white group-hover:text-[#d4ff3f] transition-colors duration-500 truncate flex items-center gap-2">
                              {link.payerName || link.name || "Anonymous Customer"}
                              {link.status === 'SETTLED' && <Check className="w-4 h-4 text-[#d4ff3f] shrink-0" />}
                            </h3>
                            <div className="flex items-center gap-4 text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px]">
                              <span className={link.status === 'SETTLED' ? 'text-[#d4ff3f]/80' : 'text-zinc-600'}>
                                {link.status === 'SETTLED' ? 'Payment Verified' : link.status === 'SUBMITTED' ? 'Processing' : 'Awaiting Payment'}
                              </span>
                              <div className="w-1 h-1 rounded-full bg-zinc-800" />
                              <span>{new Date(link.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              <div className="w-1 h-1 rounded-full bg-zinc-800" />
                              <span className="font-mono opacity-50"># {link.linkId.slice(-6).toUpperCase()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Middle: Metadata Columns */}
                        <div className="flex items-center flex-1 justify-end gap-16">
                          <div className="flex flex-col items-end gap-1.5 w-[200px] shrink-0">
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Payment Note / Ref</span>
                            <span className="text-xs font-black text-zinc-400 truncate w-full text-right">{link.note || "No Reference"}</span>
                          </div>

                          <div className="flex flex-col items-end gap-1.5 w-[80px] shrink-0">
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Method</span>
                            <div className="flex items-center gap-2">
                              {link.paymentMethod === 'upi' && <img src={upiLogo} alt="UPI" className="h-5 opacity-80" />}
                              {link.paymentMethod === 'bank' && <img src={bankLogo} alt="Bank" className="h-5 opacity-80" />}
                              {link.paymentMethod === 'razorpay' && <img src={razorpayLogo} alt="RP" className="h-5 opacity-80" />}
                              {link.paymentMethod !== 'bank' && (
                                <span className="text-xs font-black text-white uppercase">{link.paymentMethod}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1.5 w-[150px] shrink-0">
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Total Amount</span>
                            <span className="text-3xl font-black text-white tracking-tighter">
                              ₹{new Intl.NumberFormat('en-IN').format(link.amount)}
                            </span>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center justify-end gap-3 w-[160px] shrink-0 ml-10">
                          {['PENDING', 'SUBMITTED'].includes(link.status) && (
                            <>
                              {link.paymentMethod !== 'razorpay' && (
                                <button
                                  onClick={() => handleStatusUpdate(link._id, 'SETTLED')}
                                  className="w-12 h-12 rounded-full bg-[#d4ff3f]/10 text-[#d4ff3f] flex items-center justify-center hover:bg-[#d4ff3f] hover:text-black transition-all duration-300 opacity-40 hover:opacity-100 hover:rotate-12 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                                  title="Validate Payment"
                                >
                                  <Check size={20} strokeWidth={3} />
                                </button>
                              )}
                              <button
                                onClick={() => handleStatusUpdate(link._id, 'INVALIDATED')}
                                className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-black transition-all duration-300 opacity-40 hover:opacity-100 hover:-rotate-12 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                                title="Invalidate Link"
                              >
                                <X size={20} strokeWidth={3} />
                              </button>
                            </>
                          )}
                          <a
                            href={link.fullUrl || `http://localhost:5173/app?pay_id=${link.linkId}`}
                            target="_blank"
                            className="w-12 h-12 rounded-full bg-white/5 text-zinc-500 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300 opacity-40 hover:opacity-100 shadow-xl"
                            title="View Payment Page"
                          >
                            <ExternalLink size={20} />
                          </a>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: WIDGETS */}
              <div className="w-[380px] space-y-12">
                {/* TOTAL VOLUME CARD - Nixio Dark Beautification */}
                <div className="max-w-md">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-gradient-to-br from-[#121215] to-[#0a0a0c] p-10 rounded-[40px] border border-white/5 relative overflow-hidden group shadow-2xl"
                  >
                    {/* Visual Accent Decoration */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#d4ff3f]/5 rounded-full blur-[80px] group-hover:bg-[#d4ff3f]/10 transition-all duration-700" />

                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-8 opacity-40 group-hover:opacity-80 transition-opacity">
                        <span className="text-xs font-black tracking-tighter text-white">ArcPay</span>
                        <div className="w-[1px] h-3 bg-white/20" />
                        <img src={arcbyteLogo} alt="ArcByte" className="h-3 grayscale" />
                      </div>

                      <h3 className="mb-4">
                        {(() => {
                          const displayAmt = `₹${new Intl.NumberFormat('en-IN').format(Number(stats.totalRevenue || 0))}\u00A0/-`;
                          const len = displayAmt.length;
                          const sizeClass = len > 13 ? "text-3xl sm:text-4xl" : len > 10 ? "text-4xl sm:text-5xl" : "text-5xl sm:text-6xl";
                          return (
                            <span className={`text-[#d4ff3f] font-black ${sizeClass} tracking-tighter drop-shadow-[0_0_15px_rgba(117,242,198,0.3)]`}>
                              {displayAmt}
                            </span>
                          );
                        })()}
                      </h3>

                      <div className="flex items-center justify-between">
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Total Settle Volume</p>
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="w-6 h-6 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-[7px] font-black text-zinc-500">
                              {merchantName?.charAt(0) || "A"}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Pattern */}
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4ff3f]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  </motion.div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl text-white">Payment Feed</h2>
                  <div className="flex flex-col">
                    {links.filter(l => l.status === 'SETTLED').slice(0, 5).map((link, i) => (
                      <div key={i} className="flex items-center gap-5 py-6 border-b border-white/[0.03] group cursor-default transition-all hover:bg-white/[0.01]">
                        <div className="w-10 h-10 rounded-full bg-zinc-900/50 flex items-center justify-center p-2 border border-white/5 transition-transform group-hover:scale-110">
                          {link.paymentMethod === 'bank' ? <img src={bankLogo} alt="Bank" className="w-full h-full object-contain opacity-60 group-hover:opacity-100" /> :
                            link.paymentMethod === 'upi' ? <img src={upiLogo} alt="UPI" className="h-5 opacity-80" /> :
                              <img src={razorpayLogo} alt="Razorpay" className="w-full h-full object-contain opacity-60 group-hover:opacity-100" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-black text-white truncate group-hover:text-[#d4ff3f] transition-colors">{link.payerName || link.name || "Anonymous Customer"}</p>
                            <span className="text-xs font-black text-white shrink-0">₹{link.amount}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`${link.status === 'SETTLED' ? 'text-[#d4ff3f]' : 'text-zinc-600'} text-[9px] font-black uppercase tracking-widest`}>
                              {link.status}
                            </span>
                            <div className="w-0.5 h-0.5 rounded-full bg-zinc-800" />
                            <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">
                              {new Date(link.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {links.filter(l => l.status === 'SETTLED').length === 0 && (
                      <div className="flex flex-col items-center gap-2 opacity-20 py-4">
                        <ShieldCheck size={24} />
                        <p className="text-[9px] font-black uppercase tracking-widest text-center">No recent traffic</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl text-white">Pending Approvals</h2>
                  <div className="flex flex-col">
                    {links.filter(l => ['PENDING', 'SUBMITTED'].includes(l.status) && l.paymentMethod !== 'razorpay').map((link, i) => (
                      <div key={i} className="flex items-center gap-5 py-6 border-b border-white/[0.03] group cursor-default transition-all hover:bg-white/[0.01]">
                        <div className="w-10 h-10 rounded-full bg-zinc-900/50 flex items-center justify-center p-2 border border-white/5 transition-transform group-hover:scale-110 shrink-0">
                          <span className="text-[#d4ff3f] font-black text-sm uppercase">
                            {(link.payerName || link.name || "AC").charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-black text-white truncate group-hover:text-[#d4ff3f] transition-colors">{link.payerName || link.name || "Anonymous Customer"}</p>
                            <span className="text-xs font-black text-white shrink-0">₹{link.amount}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`${link.status === 'SUBMITTED' ? 'text-[#d4ff3f]' : 'text-zinc-500'} text-[9px] font-black uppercase tracking-widest`}>
                              {link.status === 'SUBMITTED' ? 'Reviewing' : 'Awaiting'}
                            </span>
                            <div className="w-0.5 h-0.5 rounded-full bg-zinc-800" />
                            <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">
                              {new Date(link.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleStatusUpdate(link._id, 'SETTLED')} 
                          className="w-10 h-10 ml-2 rounded-full border border-white/10 text-zinc-500 shrink-0 flex items-center justify-center hover:bg-[#d4ff3f] hover:border-[#d4ff3f] hover:text-black transition-all group-hover:border-white/30"
                          title="Mark as Settled"
                        >
                          <Check size={14} strokeWidth={3} />
                        </button>
                      </div>
                    ))}
                    {links.filter(l => ['PENDING', 'SUBMITTED'].includes(l.status) && l.paymentMethod !== 'razorpay').length === 0 && (
                      <div className="flex flex-col items-center gap-2 py-10 opacity-20 border-b border-white/[0.03]">
                        <Clock size={24} strokeWidth={1} />
                        <p className="text-[9px] font-black uppercase tracking-widest text-center mt-2">All clear today</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-12 pb-20">
              {/* EDITORIAL HEADER */}
              <div className="relative">
                <div className="absolute -left-20 -top-20 w-[400px] h-[400px] bg-[#d4ff3f]/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="relative z-10">
                  <p className="text-[#d4ff3f] text-[10px] font-black uppercase tracking-[0.5em] mb-4 flex items-center gap-4">
                    <span className="w-8 h-[1px] bg-[#d4ff3f]/30"></span>
                    Security System 2.4
                  </p>
                  <h2 className="text-[clamp(1.5rem,6vw,3.5rem)] italic font-black uppercase tracking-tighter leading-[0.95] text-white">
                    SECURITY<br />
                    <span className="text-[#d4ff3f] drop-shadow-[0_0_20px_rgba(212,255,63,0.2)]">SETTINGS</span>
                  </h2>
                </div>
              </div>
              {/* PERFECTED EDITORIAL SPREAD (UNCARDED T-GRID) */}
              <div className="relative border-t border-white/[0.08] pt-12">
                {/* Horizontal T-Bar */}
                <div className="absolute top-0 right-0 w-32 h-[1px] bg-[#d4ff3f]/40" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-0">
                  {/* SEGMENT I: GATE PROTOCOL */}
                  <div className="lg:pr-16 relative">
                    <div className="flex flex-col h-full">
                      <div className="flex items-center gap-4 mb-16">
                        <div className="w-1.5 h-1.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                        <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Integrated Firewall Cluster</h4>
                      </div>

                      <div className="space-y-6">
                        <h3 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none">Gate<br />Protection</h3>
                        <p className="text-zinc-600 text-[11px] font-bold uppercase tracking-widest leading-relaxed max-w-xs">
                          Enabling this setting triggers a 6-digit security code for all entry points.
                        </p>
                      </div>

                      <div className="mt-16 flex items-center gap-10">
                        <button
                          onClick={() => setMaintenanceSettings(prev => ({ ...prev, requirePasscode: !prev.requirePasscode }))}
                          className={cn(
                            "w-24 h-12 rounded-full p-1.5 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] relative overflow-hidden group shadow-2xl",
                            maintenanceSettings.requirePasscode ? "bg-[#d4ff3f]" : "bg-[#0c0c0e] border border-white/10"
                          )}
                        >
                          {/* Inner Glow */}
                          {maintenanceSettings.requirePasscode && (
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
                          )}
                          <div className={cn(
                            "w-9 h-9 rounded-full shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] relative z-10",
                            maintenanceSettings.requirePasscode ? "translate-x-12 bg-black" : "translate-x-0 bg-zinc-800"
                          )} />
                        </button>
                        <div className="flex flex-col">
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest transition-colors duration-500",
                            maintenanceSettings.requirePasscode ? "text-[#d4ff3f]" : "text-zinc-700"
                          )}>{maintenanceSettings.requirePasscode ? 'PROTECTION_ACTIVE' : 'GATE_BYPASSED'}</span>
                          <span className="text-[9px] font-black text-zinc-800 uppercase mt-1">Status Report 7-A</span>
                        </div>
                      </div>
                    </div>

                    {/* Vertical Grid Divider */}
                    <div className="hidden lg:block absolute -right-[0.5px] top-0 h-full w-[1px] bg-white/[0.05]" />
                  </div>

                  {/* NEW SEGMENT III: GLOBAL ACCESS BLOCK (Master Switch) */}
                  <div className="lg:pl-16 relative">
                    <div className="flex flex-col h-full">
                      <div className="flex items-center gap-4 mb-16">
                        <div className="w-1.5 h-1.5 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                        <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Master Access Switch</h4>
                      </div>

                      <div className="space-y-6">
                        <h3 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none">Global<br />Block</h3>
                        <p className="text-zinc-600 text-[11px] font-bold uppercase tracking-widest leading-relaxed max-w-xs">
                          Instantly prevent anyone from entering the ArcPay portal from the main landing page.
                        </p>
                      </div>

                      <div className="mt-16 flex items-center gap-10">
                        <button
                          onClick={() => setMaintenanceSettings(prev => ({ ...prev, isArcPayBlocked: !prev.isArcPayBlocked }))}
                          className={cn(
                            "w-24 h-12 rounded-full p-1.5 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] relative overflow-hidden group shadow-2xl",
                            maintenanceSettings.isArcPayBlocked ? "bg-red-500" : "bg-[#0c0c0e] border border-white/10"
                          )}
                        >
                          <div className={cn(
                            "w-9 h-9 rounded-full shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] relative z-10",
                            maintenanceSettings.isArcPayBlocked ? "translate-x-12 bg-black" : "translate-x-0 bg-zinc-800"
                          )} />
                        </button>
                        <div className="flex flex-col">
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest transition-colors duration-500",
                            maintenanceSettings.isArcPayBlocked ? "text-red-500" : "text-zinc-700"
                          )}>{maintenanceSettings.isArcPayBlocked ? 'ACCESS_BLOCKED' : 'SYSTEM_OPEN'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* T-Divider Row for Security Keys */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-0 border-t border-white/[0.05] mt-20 pt-20">
                  {/* SEGMENT II (was II, now moved down or side) */}
                  <div className="lg:pr-16 relative">
                    <div className="flex flex-col h-full">
                      <div className="flex items-center gap-4 mb-16">
                        <div className="w-1.5 h-1.5 bg-[#d4ff3f] shadow-[0_0_10px_rgba(212,255,63,0.5)]" />
                        <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Security Keys</h4>
                      </div>

                      <div className="space-y-6">
                        <h3 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none">Master<br />Access</h3>
                        <p className="text-zinc-600 text-[11px] font-bold uppercase tracking-widest leading-relaxed max-w-xs">
                          Primary override code for the terminal security suite. Changes apply instantly.
                        </p>
                      </div>

                      <div className="mt-16 space-y-6">
                        <div className="relative group">
                          <input
                            type="password"
                            placeholder="••••••"
                            maxLength={6}
                            value={maintenanceSettings.passcode}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                              setMaintenanceSettings(prev => ({ ...prev, passcode: val }));
                            }}
                            className="w-full bg-transparent border-b-2 border-white/[0.05] pb-6 text-white font-black text-7xl tracking-[0.3em] outline-none focus:border-[#d4ff3f] transition-all placeholder:text-[#111] selection:bg-[#d4ff3f]/50"
                          />
                          {maintenanceSettings.passcode?.length === 6 && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="absolute right-0 bottom-8 text-[#d4ff3f]"
                            >
                              <ShieldCheck className="w-8 h-8" />
                            </motion.div>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.3em]">Update status: Active</span>
                          <span className="text-[9px] font-black text-zinc-500 uppercase font-mono">ID: 0xFF42</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SEGMENT IV: GOOGLE AUTHENTICATOR */}
                  <div className="lg:pl-16 relative">
                    <div className="hidden lg:block absolute -left-[0.5px] top-0 h-full w-[1px] bg-white/[0.05]" />
                    <div className="flex flex-col h-full">
                      <div className="flex items-center gap-4 mb-16">
                        <div className="w-1.5 h-1.5 bg-[#d4ff3f] shadow-[0_0_10px_rgba(212,255,63,0.5)]" />
                        <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Cryptographic Module</h4>
                      </div>

                      <div className="space-y-6">
                        <h3 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none">Two-Factor<br />Lock</h3>
                        <p className="text-zinc-600 text-[11px] font-bold uppercase tracking-widest leading-relaxed max-w-xs">
                          Requires a time-based Google Authenticator code for dashboard login.
                        </p>
                      </div>

                      <div className="mt-16 flex flex-col gap-6">
                        {!auth2FA.isEnabled ? (
                          !auth2FA.isSettingUp ? (
                            <button
                              onClick={handleGenerate2FA}
                              className="group flex items-center justify-between w-full border-b-2 border-white/[0.05] pb-6 hover:border-[#d4ff3f] transition-colors"
                            >
                              <div className="flex flex-col items-start gap-1">
                                <span className="text-[12px] font-black text-zinc-600 uppercase tracking-widest leading-none group-hover:text-white transition-colors">Setup Protocol</span>
                                <span className="text-[9px] font-bold text-zinc-800 uppercase tracking-widest">Not Configured</span>
                              </div>
                              <ChevronRight className="w-8 h-8 text-zinc-800 group-hover:text-[#d4ff3f] transition-colors" />
                            </button>
                          ) : (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-16">
                              <div className="flex items-center gap-10">
                                {auth2FA.qrCode && (
                                  <div className="p-3 bg-white w-fit shadow-[0_0_40px_rgba(255,255,255,0.1)] shrink-0">
                                    <img src={auth2FA.qrCode} alt="2FA QR Code" className="w-24 h-24" />
                                  </div>
                                )}
                                <div className="flex flex-col gap-2">
                                  <span className="text-[12px] font-black text-[#d4ff3f] uppercase tracking-widest leading-none">Scan Barcode</span>
                                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed max-w-[200px]">
                                    Open your Authenticator and scan this visual payload to pair your device.
                                  </span>
                                </div>
                              </div>
                              
                              <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em]">Confirmation Code</span>
                                </div>
                                <div className="relative group">
                                  <input
                                    type="text"
                                    maxLength={6}
                                    placeholder="••••••"
                                    value={auth2FA.code}
                                    onChange={(e) => setAuth2FA(prev => ({ ...prev, code: e.target.value.replace(/[^0-9]/g, '') }))}
                                    className="w-full bg-transparent border-b-2 border-white/[0.05] pb-6 text-white font-black text-7xl tracking-[0.3em] outline-none focus:border-[#d4ff3f] transition-all placeholder:text-[#111] selection:bg-[#d4ff3f]/50"
                                  />
                                  {auth2FA.code.length === 6 && (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.5 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      className="absolute right-0 bottom-8"
                                    >
                                      <button
                                        onClick={handleEnable2FA}
                                        className="text-[#d4ff3f] hover:text-white transition-colors"
                                      >
                                        <Check className="w-8 h-8 stroke-[3]" />
                                      </button>
                                    </motion.div>
                                  )}
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className={cn(
                                    "text-[9px] font-black uppercase tracking-[0.3em]",
                                    auth2FA.code.length === 6 ? "text-[#d4ff3f] animate-pulse" : "text-zinc-800"
                                  )}>
                                    {auth2FA.code.length === 6 ? 'Pairing Ready' : 'Awaiting Output'}
                                  </span>
                                  <span className="text-[9px] font-black text-zinc-500 uppercase font-mono">SEC: 2FA_INIT</span>
                                </div>
                              </div>
                            </motion.div>
                          )
                        ) : (
                          <div className="flex flex-col h-full justify-between">
                            <div className="space-y-6">
                              <div className="flex items-center justify-between border-b-2 border-white/[0.05] pb-6">
                                <div className="flex flex-col gap-1">
                                  <span className="text-[12px] font-black text-[#d4ff3f] uppercase tracking-widest leading-none">Security Active</span>
                                  <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Protocol engaged</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-[#d4ff3f] animate-pulse shadow-[0_0_10px_#d4ff3f]" />
                                  <span className="text-[9px] font-black text-[#d4ff3f] uppercase tracking-[0.3em]">Online</span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-8 space-y-6">
                              <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black text-red-500/80 uppercase tracking-[0.4em] flex items-center gap-3">
                                  <span className="w-1.5 h-1.5 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                                  Disable Override
                                </span>
                              </div>
                              <div className="relative group">
                                <input
                                  type="password"
                                  placeholder="••••••"
                                  maxLength={6}
                                  value={auth2FA.code}
                                  onChange={(e) => setAuth2FA(prev => ({ ...prev, code: e.target.value.replace(/[^0-9]/g, '') }))}
                                  className="w-full bg-transparent border-b-2 border-white/[0.05] pb-6 text-white font-black text-7xl tracking-[0.3em] outline-none focus:border-red-500 transition-all placeholder:text-[#111] selection:bg-red-500/50"
                                />
                                {auth2FA.code.length === 6 && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute right-0 bottom-8"
                                  >
                                    <button
                                      onClick={handleDisable2FA}
                                      className="text-red-500 hover:text-white transition-colors"
                                      title="Disable 2FA"
                                    >
                                      <Ban className="w-8 h-8 stroke-[3]" />
                                    </button>
                                  </motion.div>
                                )}
                              </div>
                              <div className="flex justify-between items-center">
                                <span className={cn(
                                  "text-[9px] font-black uppercase tracking-[0.3em]",
                                  auth2FA.code.length === 6 ? "text-red-500 animate-pulse" : "text-zinc-800"
                                )}>
                                  {auth2FA.code.length === 6 ? 'Authorization Ready' : 'Awaiting Input'}
                                </span>
                                <span className="text-[9px] font-black text-zinc-500 uppercase font-mono">SEC: 2FA_ACTV</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION LAYER */}
              <div className="pt-16 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="max-w-md">
                  <h4 className="text-[#d4ff3f] text-[9px] font-black uppercase tracking-[0.4em] mb-3">Sync settings</h4>
                  <p className="text-zinc-600 text-[10px] font-medium leading-relaxed uppercase tracking-widest">
                    Applying updates triggers a global update across all locations.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    const token = localStorage.getItem('arcpay_token');
                    try {
                      const response = await fetch(`${BACKEND_URL}/api/admin/settings`, {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          requirePasscode: maintenanceSettings.requirePasscode,
                          isArcPayBlocked: maintenanceSettings.isArcPayBlocked,
                          passcode: maintenanceSettings.passcode || undefined
                        })
                      });
                      if (response.ok) {
                        showStatus({
                          type: 'success',
                          title: 'FIREWALL UPDATED',
                          message: "Security settings have been applied globally."
                        });
                        fetchDashboardData();
                      }
                    } catch (err) {
                      showStatus({
                        type: 'error',
                        title: 'UPDATE ERROR',
                        message: "Unable to save security settings to the server."
                      });
                    }
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-4 px-12 py-5 bg-[#d4ff3f] text-black rounded-full font-black uppercase tracking-widest text-[11px] hover:shadow-[0_0_50px_rgba(212,255,63,0.3)] transition-all group active:scale-95"
                >
                  <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Apply Security Settings
                </button>
              </div>

              {/* SECURITY AUDIT LOG (EDITORIAL SPREAD) */}
              <div className="pt-32 pb-20 border-t border-white/[0.05] mt-20">
                <div className="flex items-center justify-between mb-16">
                  <div className="flex flex-col gap-2">
                    <h4 className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em]">Activity Logs</h4>
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-[#d4ff3f] shadow-[0_0_8px_#d4ff3f] rounded-full animate-pulse" />
                      <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Real-time security updates active</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden md:block">
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">System Location</p>
                      <p className="text-[10px] font-mono text-zinc-400">AP_CORE_MUM_01</p>
                    </div>
                    <div className="w-[1px] h-8 bg-white/10 hidden md:block" />
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-zinc-900 flex items-center justify-center">
                          <ShieldCheck size={12} className="text-zinc-600" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-0">
                  <div className="grid grid-cols-12 pb-6 border-b border-white/[0.03] opacity-20">
                    <div className="col-span-6 text-[9px] font-black uppercase tracking-[0.3em]">Activity</div>
                    <div className="col-span-2 text-[9px] font-black uppercase tracking-[0.3em] text-center">Status</div>
                    <div className="col-span-2 text-[9px] font-black uppercase tracking-[0.3em] text-center">Time</div>
                    <div className="col-span-2 text-[9px] font-black uppercase tracking-[0.3em] text-right">Location</div>
                  </div>

                  <div className="divide-y divide-white/[0.03]">
                    {[
                      { event: 'PASSCODE_VERIFIED', status: 'VERIFIED', time: '2m ago', origin: 'MUM-01', type: 'success' },
                      { event: 'SETTINGS_UPDATED', status: 'SYNCED', time: '14m ago', origin: 'SYS-CORE', type: 'info' },
                      { event: 'ACCESS_BLOCKED', status: 'REJECTED', time: '42m ago', origin: 'GW-PROXY', type: 'error' },
                      { event: 'SESSION_CHECK_PASSED', status: 'PASSED', time: '1h ago', origin: 'EDGE-02', type: 'success' },
                      { event: 'SECURITY_KEY_ROTATION', status: 'SECURED', time: '3h ago', origin: 'KMS-MAIN', type: 'info' }
                    ].map((log, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
                        className="grid grid-cols-12 py-10 items-center group cursor-default"
                      >
                        <div className="col-span-12 md:col-span-6 mb-4 md:mb-0">
                          <div className="flex items-center gap-6">
                            <span className="text-[10px] font-mono text-zinc-800 tabular-nums">0{i + 1}</span>
                            <h3 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter group-hover:text-[#d4ff3f] transition-all duration-500">
                              {log.event.replace(/_/g, ' ')}
                            </h3>
                          </div>
                        </div>

                        <div className="col-span-4 md:col-span-2 flex justify-start md:justify-center">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              log.type === 'success' ? "bg-[#d4ff3f] shadow-[0_0_8px_#d4ff3f]" :
                                log.type === 'error' ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" :
                                  "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]"
                            )} />
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-widest",
                              log.type === 'success' ? "text-[#d4ff3f]" :
                                log.type === 'error' ? "text-red-500" :
                                  "text-blue-400"
                            )}>{log.status}</span>
                          </div>
                        </div>

                        <div className="col-span-4 md:col-span-2 text-[10px] font-bold text-zinc-600 text-center uppercase tracking-widest">
                          {log.time}
                        </div>

                        <div className="col-span-4 md:col-span-2 text-right">
                          <span className="text-[10px] font-mono text-zinc-800 group-hover:text-zinc-500 transition-colors uppercase">
                            // {log.origin}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'links' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-[1px] bg-[#d4ff3f]/40" />
                    <span className="text-[10px] font-black text-[#d4ff3f] uppercase tracking-[0.4em]">Asset Management Suite</span>
                  </div>
                  <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">
                    Link <span className="text-zinc-600">Control</span>
                  </h2>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1">Active Assets</span>
                    <span className="text-xl font-black text-white">{links.length.toString().padStart(2, '0')}</span>
                  </div>
                  <div className="w-[1px] h-8 bg-white/5" />
                  <button
                    onClick={fetchDashboardData}
                    className="p-3 bg-white/5 rounded-2xl text-zinc-500 hover:text-[#d4ff3f] transition-all hover:scale-110"
                  >
                    <RefreshCcw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1 min-h-[600px]">
                {links.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-40 bg-[#0a0a0c] rounded-[40px] border border-dashed border-white/5">
                    <LinkIcon className="w-12 h-12 text-zinc-800 mb-6" />
                    <p className="text-zinc-600 font-black uppercase tracking-[0.2em] text-[10px]">No payment assets registered in system</p>
                  </div>
                ) : (
                  links.map((link, i) => (
                    <motion.div
                      key={link._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="group relative flex items-center justify-between py-10 px-8 border-b border-white/[0.03] hover:bg-white/[0.02] transition-all duration-500 rounded-[32px] cursor-default"
                    >
                      <div className="flex items-center gap-10 w-[400px]">
                        <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/5 text-zinc-600 group-hover:text-[#d4ff3f] transition-all duration-500 group-hover:rotate-12">
                          <Smartphone size={24} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span className="text-white font-black text-xl tracking-tight uppercase italic">{link.linkId.toUpperCase()}</span>
                          <div className="flex items-center gap-3">
                            <div className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest", link.amount ? "bg-white/5 text-zinc-400" : "bg-[#d4ff3f] text-black italic")}>
                              {link.amount ? 'Fixed Value' : 'Open Amount'}
                            </div>
                            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{new Date(link.createdAt).toDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 flex items-center gap-20 justify-end h-full pr-10">
                        <div className="flex flex-col items-end gap-1.5 min-w-[150px]">
                          <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Linked Merchant</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-zinc-400">{link.name || "Default Vendor"}</span>
                            <img src={arcbyteLogo} alt="ArcByte" className="h-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 min-w-[100px]">
                          <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Asset Status</span>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-[#d4ff3f] rounded-full shadow-[0_0_8px_#d4ff3f]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Online</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 min-w-[200px] justify-end">
                        <button
                          onClick={() => {
                            const url = link.fullUrl || `${window.location.origin}/app?pay_id=${link.linkId}`;
                            navigator.clipboard.writeText(url);
                            showStatus({ type: 'success', title: 'LINK COPIED', message: 'Ready for distribution.' });
                          }}
                          className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:bg-[#d4ff3f] hover:text-black transition-all group/copy"
                        >
                          <Copy size={14} className="group-hover/copy:scale-110 transition-transform" />
                          Copy Link
                        </button>

                        <button
                          onClick={async () => {
                            if (!window.confirm("PERMANENTLY DELETE ASSET? DATA RECOVERY IS IMPOSSIBLE.")) return;
                            const token = localStorage.getItem('arcpay_token');
                            try {
                              const response = await fetch(`${BACKEND_URL}/api/admin/links/${link._id}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${token}` }
                              });
                              if (response.ok) {
                                showStatus({ type: 'success', title: 'ASSET DELETED', message: 'Link permanently removed from system.' });
                                fetchDashboardData();
                              }
                            } catch (err) {
                              showStatus({ type: 'error', title: 'DELETE FAILED', message: 'Security system blocked removal.' });
                            }
                          }}
                          className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-black transition-all shadow-xl"
                        >
                          <Trash2 size={18} />
                        </button>

                        <a
                          href={link.fullUrl || `${window.location.origin}/app?pay_id=${link.linkId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-12 h-12 rounded-2xl bg-white/5 text-zinc-600 flex items-center justify-center hover:bg-zinc-800 hover:text-white transition-all shadow-xl"
                        >
                          <ExternalLink size={18} />
                        </a>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="space-y-16">
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-[clamp(1.5rem,5vw,5rem)] text-white">
                    SITE ACCESS <br />
                    <span className="text-[#d4ff3f]">CONFIGURATION</span>
                  </h2>
                  <div className="flex items-center gap-3 mt-8">
                    <span className="px-3 py-1 bg-[#d4ff3f] text-black text-[10px] font-black uppercase tracking-widest rounded-full">Admin Control</span>
                    <span className="text-zinc-600 text-[10px] font-black uppercase tracking-widest uppercase">Server Control 882</span>
                  </div>
                </div>
              </div>

              <div className="space-y-16 relative py-8">
                {/* Thin Vertical Grid Line */}
                <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-white/[0.05] pointer-events-none" />

                <div className="flex items-center justify-between relative z-10 pl-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-[#d4ff3f] shadow-[0_0_8px_#d4ff3f]" />
                      <h3 className="text-xl text-white">Maintenance Mode</h3>
                    </div>
                    <p className="text-[12px] font-bold text-zinc-500 max-w-lg uppercase tracking-tight pl-4 leading-relaxed">When active, the public payment gateway will be inaccessible. Admins can still manage the system.</p>
                  </div>
                  <button
                    onClick={() => setMaintenanceSettings(prev => ({ ...prev, isMaintenanceMode: !prev.isMaintenanceMode }))}
                    className={`w-20 h-10 rounded-full p-1.5 transition-all duration-300 border border-white/10 ${maintenanceSettings.isMaintenanceMode ? 'bg-[#d4ff3f]' : 'bg-zinc-800'}`}
                  >
                    <div className={`w-7 h-7 rounded-full transition-transform duration-300 transform ${maintenanceSettings.isMaintenanceMode ? 'translate-x-10 bg-black' : 'translate-x-0 bg-zinc-600'}`} />
                  </button>
                </div>

                <div className="h-[1px] bg-white/[0.03]" />

                <div className="grid grid-cols-1 gap-12 pl-10">
                  <div className="space-y-4 max-w-2xl">
                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#d4ff3f]">System Message</label>
                    <textarea
                      rows="4"
                      value={maintenanceSettings.maintenanceMessage}
                      onChange={(e) => setMaintenanceSettings(prev => ({ ...prev, maintenanceMessage: e.target.value }))}
                      placeholder="WE ARE CURRENTLY UPDATING OUR INFRASTRUCTURE..."
                      className="w-full bg-transparent border-b border-white/10 rounded-none py-4 text-white font-bold outline-none focus:border-[#d4ff3f] transition-all resize-none uppercase text-sm placeholder:text-zinc-800"
                    />
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">This message will be displayed directly to all public visitors during downtime.</p>
                  </div>
                </div>

                <div className="h-[1px] bg-white/[0.03]" />

                <div className="pt-8 flex items-center gap-10 pl-10 border-t border-white/[0.03]">
                  <button
                    onClick={async () => {
                      const token = localStorage.getItem('arcpay_token');
                      try {
                        const response = await fetch(`${BACKEND_URL}/api/admin/settings`, {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                            isMaintenanceMode: maintenanceSettings.isMaintenanceMode,
                            maintenanceEndTime: maintenanceSettings.maintenanceEndTime,
                            maintenanceMessage: maintenanceSettings.maintenanceMessage,
                            isArcPayBlocked: maintenanceSettings.isArcPayBlocked,
                            requirePasscode: maintenanceSettings.requirePasscode,
                            passcode: maintenanceSettings.passcode || undefined // Only send if user changed it
                          })
                        });
                        if (response.ok) {
                          showStatus({
                            type: 'success',
                            title: 'SYSTEM CONFIG',
                            message: "Maintenance settings successfully applied."
                          });
                          fetchDashboardData();
                        }
                      } catch (err) {
                        showStatus({
                          type: 'error',
                          title: 'UPDATE FAILURE',
                          message: "Unable to update global system state."
                        });
                      }
                    }}
                    className="flex items-center gap-3 px-12 py-5 bg-[#d4ff3f] text-black rounded-full font-black uppercase tracking-widest text-[11px] hover:shadow-[0_0_30px_#d4ff3f]/30 transition-all group"
                  >
                    <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
                    Save Changes
                  </button>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">System Status</span>
                    <span className="text-[10px] font-bold text-zinc-600 uppercase">Main Server Sync Active</span>
                  </div>
                </div>
              </div>

              <div className="py-10 pl-10 flex items-center gap-8 relative overflow-hidden group">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-[#d4ff3f] border border-white/10 shadow-2xl">
                  <ShieldCheck size={24} />
                </div>
                <div className="flex flex-col gap-2">
                  <h4 className="text-white text-[13px]">Security: On</h4>
                  <p className="text-zinc-600 text-[11px] font-bold uppercase tracking-tight">System state is currently locked and monitored via security system.</p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'payments' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-[1px] bg-[#d4ff3f]/40" />
                    <span className="text-[10px] font-black text-[#d4ff3f] uppercase tracking-[0.4em]">Integrated Ledger Control</span>
                  </div>
                  <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">
                    Master <span className="text-zinc-600">Ledger</span>
                  </h2>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1">Total Entries</span>
                    <span className="text-xl font-black text-white">{filteredLinks.length.toString().padStart(2, '0')}</span>
                  </div>
                  <div className="w-[1px] h-8 bg-white/5" />
                  <button
                    onClick={fetchDashboardData}
                    className="p-3 bg-white/5 rounded-2xl text-zinc-500 hover:text-[#d4ff3f] transition-all hover:scale-110"
                  >
                    <RefreshCcw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1 min-h-[600px]">
                {filteredLinks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-40 bg-[#0a0a0c] rounded-[40px] border border-dashed border-white/5">
                    <Search className="w-12 h-12 text-zinc-800 mb-6" />
                    <p className="text-zinc-600 font-black uppercase tracking-[0.2em] text-[10px]">No matches found for your current filters</p>
                  </div>
                ) : (
                  filteredLinks.map((link, i) => (
                    <motion.div
                      key={link._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="group relative flex items-center justify-between py-10 px-8 border-b border-white/[0.03] hover:bg-white/[0.02] transition-all duration-500 rounded-[32px] cursor-default"
                    >
                      {/* Detailed Column Layout */}
                      <div className="flex items-center gap-10 w-[350px]">
                        <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/5 text-lg font-black text-[#d4ff3f] shadow-2xl relative">
                          {(link.payerName || link.name || "AC").charAt(0)}
                          <div className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-black ${link.status === 'SETTLED' ? 'bg-[#d4ff3f]' :
                              link.status === 'SUBMITTED' ? 'bg-[#d4ff3f] animate-pulse' :
                                'bg-zinc-800'
                            }`} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-white font-black text-xl truncate tracking-tight group-hover:text-[#d4ff3f] transition-colors">{link.payerName || link.name || "Anonymous"}</span>
                          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">{new Date(link.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>

                      <div className="flex-1 grid grid-cols-3 gap-10 items-center px-10">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Transaction Verified</span>
                          <span className="text-[11px] font-bold text-zinc-400 group-hover:text-white transition-colors">{link.linkId.toUpperCase()}</span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Payment Security</span>
                          <div className="flex items-center gap-2">
                            <ShieldCheck className={cn("w-3.5 h-3.5", link.status === 'SETTLED' ? "text-[#d4ff3f]" : "text-zinc-600")} />
                            <span className={cn("text-[10px] font-black uppercase tracking-widest", link.status === 'SETTLED' ? "text-[#d4ff3f]" : "text-zinc-500")}>
                              {link.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 pr-10">
                          <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Settlement Value</span>
                          <span className="text-2xl font-black text-white tracking-tighter">₹{new Intl.NumberFormat('en-IN').format(link.amount)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {['PENDING', 'SUBMITTED'].includes(link.status) && (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleStatusUpdate(link._id, 'SETTLED')}
                              className="w-12 h-12 rounded-2xl bg-[#d4ff3f]/10 text-[#d4ff3f] flex items-center justify-center hover:bg-[#d4ff3f] hover:text-black transition-all shadow-xl"
                            >
                              <Check size={20} />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(link._id, 'INVALIDATED')}
                              className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-black transition-all shadow-xl"
                            >
                              <X size={20} />
                            </button>
                          </div>
                        )}
                        <a
                          href={link.fullUrl || `http://localhost:5173/app?pay_id=${link.linkId}`}
                          target="_blank"
                          className="w-12 h-12 rounded-2xl bg-white/5 text-zinc-600 flex items-center justify-center hover:bg-zinc-800 hover:text-white transition-all"
                        >
                          <ExternalLink size={18} />
                        </a>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          )}
          {['stats', 'users'].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="relative mb-12">
                <div className="absolute -inset-20 bg-[#d4ff3f]/5 rounded-full blur-[100px] pointer-events-none" />
                <p className="text-[#d4ff3f] text-[10px] font-black uppercase tracking-[0.5em] mb-4 flex items-center justify-center gap-4">
                  <span className="w-8 h-[1px] bg-[#d4ff3f]/30"></span>
                  Module under construction
                  <span className="w-8 h-[1px] bg-[#d4ff3f]/30"></span>
                </p>
                <h2 className="text-[clamp(2rem,10vw,6rem)] italic font-black uppercase tracking-tighter leading-none text-white mix-blend-difference">
                  COMING<br />
                  <span className="text-[#d4ff3f] drop-shadow-[0_0_30px_rgba(212,255,63,0.3)]">SOON</span>
                </h2>
              </div>

              <div className="flex flex-col items-center gap-6">
                <div className="flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/5 rounded-full backdrop-blur-md">
                  <div className="w-1.5 h-1.5 bg-[#d4ff3f] rounded-full animate-pulse shadow-[0_0_8px_#d4ff3f]" />
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">System Status: Active</span>
                </div>
                <p className="text-zinc-600 text-[11px] font-bold uppercase tracking-[0.2em] max-w-sm leading-relaxed">
                  This administrative system is currently being configured for detailed reports and payment matching.
                </p>
              </div>
            </div>
          )}

        </section>
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #16161a; border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
