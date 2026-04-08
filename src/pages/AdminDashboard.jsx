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
  LayoutGrid, X, Zap, Lock
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

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('arcpay_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    try {
      const [statsRes, linksRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/admin/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${BACKEND_URL}/api/admin/links`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (statsRes.status === 401 || linksRes.status === 401) {
        localStorage.removeItem('arcpay_token');
        navigate('/admin/login');
        return;
      }

      const statsData = await statsRes.json();
      const linksData = await linksRes.json();

      setStats(statsData);
      setLinks(linksData);
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

  const handleLogout = () => {
    localStorage.removeItem('arcpay_token');
    navigate('/admin/login');
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
      {/* NIXIO SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex w-[100px] flex-col items-center py-10 border-r border-[#ffffff0a] bg-[#0a0a0c] z-50">
        <div className="mb-16">
          <ShieldCheck className="w-8 h-8 text-[#d4ff3f]" strokeWidth={2.5} />
        </div>

        <nav className="flex flex-col gap-10 flex-1">
          {[
            { id: 'home', icon: Home },
            { id: 'security', icon: ShieldCheck },
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

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[80px] bg-[#0a0a0c]/80 backdrop-blur-xl border-t border-[#ffffff0a] flex items-center justify-around px-2 z-[100] safe-area-bottom">
        {[
          { id: 'home', icon: Home },
          { id: 'links', icon: LinkIcon },
          { id: 'payments', icon: Wallet },
          { id: 'security', icon: ShieldCheck },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "relative flex flex-col items-center justify-center gap-1.5 px-3 py-2 transition-all",
              activeTab === item.id ? "text-[#d4ff3f]" : "text-zinc-600"
            )}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[8px] font-black uppercase tracking-widest">{item.id}</span>
            {activeTab === item.id && (
              <motion.div layoutId="mobile-active-pill" className="absolute -top-[1.5px] left-1/2 -translate-x-1/2 w-8 h-[3px] bg-[#d4ff3f] rounded-full shadow-[0_0_10px_#d4ff3f]" />
            )}
          </button>
        ))}
        <button onClick={handleLogout} className="flex flex-col items-center justify-center gap-1.5 px-3 py-2 text-zinc-600">
          <LogOut className="w-5 h-5 shadow-sm" />
          <span className="text-[8px] font-black uppercase tracking-widest">Quit</span>
        </button>
      </nav>

      {/* MAIN PANEL */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* NIXIO TOPBAR */}
        <header className="h-auto min-h-[100px] lg:h-[100px] flex flex-col lg:flex-row lg:items-center justify-between px-6 lg:px-10 border-b border-[#ffffff0a] py-6 lg:py-0 gap-6 lg:gap-0">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-10">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black tracking-tighter text-white">ArcPay</span>
              <div className="w-[1px] h-6 bg-white/10" />
              <img src={arcbyteLogo} alt="ArcByte" className="h-6 opacity-80" />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
              <div className="relative group w-full sm:w-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[#d4ff3f] transition-colors" />
                <input
                  type="text"
                  placeholder="Find payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[#16161a] h-12 rounded-2xl pl-12 pr-6 text-sm font-bold w-full sm:w-[260px] outline-none border border-transparent focus:border-[#d4ff3f]/30 transition-all placeholder:text-zinc-700"
                />
              </div>

              <div className="flex items-center gap-2 bg-[#16161a] p-1.5 rounded-2xl border border-white/5 w-full sm:w-auto overflow-x-auto no-scrollbar">
                {['ALL', 'PENDING', 'SETTLED', 'INVALID'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s === 'INVALID' ? 'INVALIDATED' : s)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shrink-0",
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
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-6 lg:gap-10 border-t lg:border-t-0 border-white/5 pt-6 lg:pt-0">
            <div className="hidden sm:flex -space-x-4 group/avatars">
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

            <div className="flex items-center gap-5 ml-0 lg:ml-4 pl-0 lg:pl-10 border-l-0 lg:border-l border-white/5">
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
              <div className="relative group/user hidden sm:block">
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
            <div className="flex flex-col xl:flex-row gap-10">
              {/* LEFT COLUMN: STATS & LIST */}
              <div className="flex-1 space-y-12">
                {/* STATISTICS SECTION */}
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-0">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-[1px] bg-[#d4ff3f]/40" />
                        <span className="text-[10px] font-black text-[#d4ff3f] uppercase tracking-[0.4em]">Integrated Security Firewall</span>
                      </div>
                      <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
                        Security <span className="text-zinc-600">Settings</span>
                      </h2>
                    </div>
                    <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest pb-2 overflow-x-auto no-scrollbar">
                      {['Days', 'Weeks', 'Months'].map(t => (
                        <button key={t} className={t === 'Days' ? 'text-white border-b-2 border-[#d4ff3f] shrink-0' : 'text-zinc-600 hover:text-white transition-colors shrink-0'}>{t}</button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#0a0a0c] rounded-[32px] border border-[#ffffff08] p-6 md:p-10 relative overflow-hidden h-auto min-h-[400px]">
                    {/* Date Scroller */}
                    <div className="flex gap-4 overflow-x-auto no-scrollbar mb-10 pb-4 pr-10">
                      {dynamicDays.map((d, i) => {
                        const dayStats = stats.dailyStats?.find(s => s.date === d.dateStr);
                        const isSelected = selectedDate === d.dateStr;
                        return (
                          <div
                            key={i}
                            onClick={() => setSelectedDate(isSelected ? null : d.dateStr)}
                            className={`flex flex-col items-center justify-center min-w-[64px] md:min-w-[72px] h-[80px] md:h-[90px] rounded-2xl border transition-all duration-500 cursor-pointer ${isSelected ? 'bg-[#d4ff3f] border-[#d4ff3f] text-black shadow-[0_0_25px_rgba(212,255,63,0.2)]' : 'bg-[#16161a] border-white/5 text-zinc-500 hover:border-white/10'}`}
                          >
                            <span className="text-[10px] md:text-[11px] font-black uppercase mb-1">{d.num}</span>
                            <span className="text-[8px] md:text-[9px] font-bold opacity-60 uppercase tracking-widest">{d.day}</span>
                            {dayStats?.revenue > 0 && (
                              <div className={`mt-2 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-black/20' : 'bg-[#d4ff3f]'}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Dynamic Chart Visual */}
                    <div className="relative h-40 md:h-48 w-full mt-10">
                      <StatLine color="#d4ff3f" data={stats.dailyStats} selectedDate={selectedDate} />
                      <StatLine color="#ffffff" dashed={true} data={stats.dailyStats?.map(d => ({ ...d, revenue: d.revenue * 0.8 }))} selectedDate={selectedDate} />

                      {/* Time markers */}
                      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 overflow-hidden">
                        {['7 am', '10 am', '1 pm', '4 pm', '7 pm'].map(t => (
                          <span key={t} className="text-[7px] md:text-[8px] font-black text-zinc-700 uppercase">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ONGOING PAYMENTS SCROLLER */}
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-[1px] bg-[#d4ff3f]/40" />
                          <span className="text-[10px] font-black text-[#d4ff3f] uppercase tracking-[0.4em]">Settlement Feed</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
                          Recent <span className="text-zinc-600">Payments</span>
                        </h2>
                      </div>
                      {selectedDate && (
                        <div className="flex items-center gap-2 self-start px-3 py-1 bg-[#d4ff3f]/10 border border-[#d4ff3f]/20 rounded-full">
                          <span className="text-[10px] font-black text-[#d4ff3f] uppercase tracking-widest">
                            {new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                          </span>
                          <button onClick={() => setSelectedDate(null)} className="text-[#d4ff3f]/60 hover:text-[#d4ff3f]">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 self-end md:self-auto">
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

                  <div className="flex flex-col gap-2 pb-20">
                    {filteredLinks.slice(0, 8).map((link, i) => (
                      <motion.div
                        key={link._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group relative flex flex-col md:flex-row md:items-center justify-between py-6 md:py-10 px-6 border-b border-white/[0.03] hover:bg-white/[0.02] transition-all duration-500 rounded-[24px] gap-6 md:gap-0"
                      >
                        {/* Left: Identity & Primary Info */}
                        <div className="flex items-center gap-6 md:gap-10 w-full md:w-[45%]">
                          <div className="relative shrink-0">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-zinc-900 rounded-full flex items-center justify-center border border-white/5 text-lg md:text-xl font-black text-[#d4ff3f] shadow-2xl transition-transform group-hover:scale-110 duration-500">
                              {(link.payerName || link.name || "AC").charAt(0)}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 rounded-full border-2 md:border-4 border-black ${
                              link.status === 'SETTLED' ? 'bg-[#d4ff3f]' : 
                              link.status === 'SUBMITTED' ? 'bg-[#d4ff3f] animate-pulse' : 
                              'bg-zinc-800'
                            }`} />
                          </div>

                          <div className="flex flex-col gap-1 md:gap-2 min-w-0">
                            <h3 className="text-xl md:text-2xl text-white group-hover:text-[#d4ff3f] transition-colors duration-500 truncate flex items-center gap-2 tracking-tight">
                              {link.payerName || link.name || "Anonymous Customer"}
                              {link.status === 'SETTLED' && <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#d4ff3f] shrink-0" />}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 md:gap-4 text-zinc-500 font-bold uppercase tracking-[0.2em] text-[9px] md:text-[10px]">
                              <span className={link.status === 'SETTLED' ? 'text-[#d4ff3f]/80' : 'text-zinc-600'}>
                                {link.status === 'SETTLED' ? 'Verified' : link.status === 'SUBMITTED' ? 'Processing' : 'Awaiting'}
                              </span>
                              <div className="w-1 h-1 rounded-full bg-zinc-800" />
                              <span>{new Date(link.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              <div className="w-1 h-1 rounded-full bg-zinc-800 hidden sm:block" />
                              <span className="font-mono opacity-50 hidden sm:block"># {link.linkId.slice(-6).toUpperCase()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Middle: Metadata Column for Mobile/Desktop */}
                        <div className="flex items-center justify-between md:justify-end flex-1 gap-6 md:gap-16">
                          <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0">
                            <span className="text-[8px] md:text-[10px] font-black text-zinc-600 uppercase tracking-widest">Amount</span>
                            <span className="text-xl md:text-3xl font-black text-white tracking-tighter">
                              ₹{new Intl.NumberFormat('en-IN').format(link.amount)}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end gap-1.5 hidden sm:flex shrink-0">
                              {link.paymentMethod === 'upi' && <img src={upiLogo} alt="UPI" className="h-4 md:h-5 opacity-60" />}
                              {link.paymentMethod === 'bank' && <img src={bankLogo} alt="Bank" className="h-4 md:h-5 opacity-60" />}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {['PENDING', 'SUBMITTED'].includes(link.status) && link.paymentMethod !== 'razorpay' && (
                                <button
                                  onClick={() => handleStatusUpdate(link._id, 'SETTLED')}
                                  className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#d4ff3f]/10 text-[#d4ff3f] flex items-center justify-center hover:bg-[#d4ff3f] hover:text-black transition-all"
                                >
                                  <Check size={18} strokeWidth={3} />
                                </button>
                              )}
                              <a
                                href={link.fullUrl || `http://localhost:5173/app?pay_id=${link.linkId}`}
                                target="_blank"
                                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 text-zinc-500 flex items-center justify-center hover:bg-white hover:text-black transition-all"
                              >
                                <ExternalLink size={18} />
                              </a>
                            </div>
                          </div>
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

                      <h3 className="text-6xl text-[#d4ff3f] mb-4">
                        {stats.totalRevenue > 100000 ? `₹${(stats.totalRevenue / 1000).toFixed(0)}k` : `₹${stats.totalRevenue}`}
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
                  <div className="space-y-4">
                    {links.filter(l => l.status === 'SUBMITTED').map((link, i) => (
                      <div key={i} className="bg-[#16161a] p-6 rounded-3xl border border-white/5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-[#d4ff3f] font-black">
                          {(link.payerName || link.name || "AC").charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-black text-white">{link.payerName || link.name || "Anonymous Customer"}</p>
                          <p className="text-[10px] font-bold text-zinc-500">₹{link.amount} • Waiting</p>
                        </div>
                        <button onClick={() => handleStatusUpdate(link._id, 'SETTLED')} className="w-8 h-8 rounded-lg bg-[#d4ff3f]/10 text-[#d4ff3f] flex items-center justify-center hover:bg-[#d4ff3f] hover:text-black transition-colors">
                          <Check size={14} />
                        </button>
                      </div>
                    ))}
                    {links.filter(l => l.status === 'SUBMITTED').length === 0 && (
                      <div className="p-8 rounded-3xl border border-white/5 border-dashed flex flex-col items-center gap-4 text-center opacity-40">
                        <Clock size={32} strokeWidth={1} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">All clear today</p>
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
                        <h3 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none">Gate<br/>Protection</h3>
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
                        <h3 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none">Global<br/>Block</h3>
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
                        <h3 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none">Master<br/>Access</h3>
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
            <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32 px-6 md:px-10">
               <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-0">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-[1px] bg-[#d4ff3f]/40" />
                    <span className="text-[10px] font-black text-[#d4ff3f] uppercase tracking-[0.4em]">Asset Management Suite</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
                    Link <span className="text-zinc-600">Control</span>
                  </h2>
                </div>
                
                <div className="flex items-center gap-6 self-end md:self-auto">
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

              <div className="grid grid-cols-1 lg:flex lg:flex-col gap-4 lg:gap-1">
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
                      className="group relative flex flex-col lg:flex-row lg:items-center justify-between py-6 md:py-10 px-6 md:px-8 border border-white/[0.03] lg:border-0 lg:border-b border-white/[0.03] bg-[#0a0a0c] lg:bg-transparent hover:bg-white/[0.02] transition-all duration-500 rounded-[24px] lg:rounded-[32px] cursor-default gap-6 lg:gap-0"
                    >
                      <div className="flex items-center gap-6 md:gap-10 w-full lg:w-[400px]">
                         <div className="w-12 h-12 md:w-14 md:h-14 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/5 text-zinc-600 group-hover:text-[#d4ff3f] transition-all duration-500 group-hover:rotate-12 shrink-0">
                           <Smartphone size={24} />
                         </div>
                         <div className="flex flex-col gap-1.5 min-w-0">
                            <span className="text-white font-black text-lg md:text-xl tracking-tight uppercase italic truncate">{link.linkId.toUpperCase()}</span>
                            <div className="flex flex-wrap items-center gap-3">
                               <div className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest", link.amount ? "bg-white/5 text-zinc-400" : "bg-[#d4ff3f] text-black italic")}>
                                  {link.amount ? 'Fixed Value' : 'Open Amount'}
                               </div>
                               <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{new Date(link.createdAt).toLocaleDateString()}</span>
                            </div>
                         </div>
                      </div>

                      <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-6 md:gap-20 justify-end h-full pr-0 lg:pr-10 border-t lg:border-t-0 border-white/5 pt-6 lg:pt-0">
                         <div className="flex flex-col items-start sm:items-end gap-1.5 min-w-[150px]">
                            <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Linked Merchant</span>
                            <div className="flex items-center gap-2">
                               <span className="text-[11px] font-bold text-zinc-400">{link.name || "Default Vendor"}</span>
                               <img src={arcbyteLogo} alt="ArcByte" className="h-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                            </div>
                         </div>

                         <div className="flex flex-col items-start sm:items-end gap-1.5 min-w-[100px]">
                            <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Asset Status</span>
                            <div className="flex items-center gap-2">
                               <div className="w-1.5 h-1.5 bg-[#d4ff3f] rounded-full shadow-[0_0_8px_#d4ff3f]" />
                               <span className="text-[10px] font-black uppercase tracking-widest text-white">Online</span>
                            </div>
                         </div>
                      </div>

                      <div className="flex items-center gap-3 min-w-[200px] justify-end border-t lg:border-t-0 border-white/5 pt-6 lg:pt-0">
                        <button
                          onClick={() => {
                            const url = link.fullUrl || `${window.location.origin}/app?pay_id=${link.linkId}`;
                            navigator.clipboard.writeText(url);
                            showStatus({ type: 'success', title: 'LINK COPIED', message: 'Ready for distribution.' });
                          }}
                          className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-6 py-3 bg-white/5 rounded-2xl text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:bg-[#d4ff3f] hover:text-black transition-all group/copy"
                        >
                          <Copy size={14} className="group-hover/copy:scale-110 transition-transform" />
                          <span className="lg:hidden xl:inline">Copy</span>
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
                          className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-black transition-all shadow-xl shrink-0"
                        >
                          <Trash2 size={18} />
                        </button>

                        <a
                          href={link.fullUrl || `${window.location.origin}/app?pay_id=${link.linkId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-12 h-12 rounded-2xl bg-white/5 text-zinc-600 flex items-center justify-center hover:bg-zinc-800 hover:text-white transition-all shadow-xl shrink-0"
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

          {activeTab === 'payments' && (
            <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32 px-6 md:px-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-0">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-[1px] bg-[#d4ff3f]/40" />
                    <span className="text-[10px] font-black text-[#d4ff3f] uppercase tracking-[0.4em]">Integrated Ledger Control</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
                    Master <span className="text-zinc-600">Ledger</span>
                  </h2>
                </div>
                
                <div className="flex items-center gap-6 self-end md:self-auto">
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

              <div className="flex-1 overflow-y-auto no-scrollbar">
              <div className="flex flex-col gap-3 md:gap-1 min-h-[600px] ">
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
                      className="group relative flex flex-col lg:flex-row lg:items-center justify-between py-6 md:py-10 px-6 md:px-8 border-b border-white/[0.03] hover:bg-white/[0.02] transition-all duration-500 rounded-[24px] md:rounded-[32px] gap-6 lg:gap-0"
                    >
                      {/* Identity Section */}
                      <div className="flex items-center gap-6 md:gap-10 w-full lg:w-[350px]">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/5 text-lg font-black text-[#d4ff3f] shadow-2xl relative shrink-0">
                          {(link.payerName || link.name || "AC").charAt(0)}
                          <div className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-black ${
                            link.status === 'SETTLED' ? 'bg-[#d4ff3f]' : 
                            link.status === 'SUBMITTED' ? 'bg-[#d4ff3f] animate-pulse' : 
                            'bg-zinc-800'
                          }`} />
                        </div>
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="text-white font-black text-lg md:text-xl truncate tracking-tight group-hover:text-[#d4ff3f] transition-colors">{link.payerName || link.name || "Anonymous"}</span>
                          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">{new Date(link.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>

                      {/* Info Grid */}
                      <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 items-center px-0 lg:px-10">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Transaction Verified</span>
                          <span className="text-[11px] font-bold text-zinc-400 group-hover:text-white transition-colors truncate">{link.linkId.toUpperCase()}</span>
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
                        <div className="flex flex-col items-start lg:items-end gap-1.5 col-span-2 lg:col-span-1 border-t lg:border-t-0 border-white/5 pt-4 lg:pt-0">
                          <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Settlement Value</span>
                          <span className="text-2xl md:text-3xl font-black text-white tracking-tighter">₹{new Intl.NumberFormat('en-IN').format(link.amount)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-3 md:gap-4 border-t lg:border-t-0 border-white/5 pt-6 lg:pt-0">
                        {['PENDING', 'SUBMITTED'].includes(link.status) && (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleStatusUpdate(link._id, 'SETTLED')}
                              className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-[#d4ff3f]/10 text-[#d4ff3f] flex items-center justify-center hover:bg-[#d4ff3f] hover:text-black transition-all shadow-xl"
                            >
                              <Check size={20} />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(link._id, 'INVALIDATED')}
                              className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-black transition-all shadow-xl"
                            >
                              <X size={20} />
                            </button>
                          </div>
                        )}
                        <a
                          href={link.fullUrl || `http://localhost:5173/app?pay_id=${link.linkId}`}
                          target="_blank"
                          className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/5 text-zinc-600 flex items-center justify-center hover:bg-zinc-800 hover:text-white transition-all shadow-xl"
                        >
                          <ExternalLink size={18} />
                        </a>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
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
