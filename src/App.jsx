import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AdminSetup from './pages/AdminSetup';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Maintenance from './pages/Maintenance';
import { Toaster as SonnerToaster } from 'sonner'; // Will be removed in next pass
import { useState, useEffect } from 'react';

import { NotificationProvider } from './context/NotificationContext';
import GlobalStatusSheet from './components/shared/GlobalStatusSheet';

export default function App() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const payId = searchParams.get('pay_id');
  const [maintenance, setMaintenance] = useState(null);

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/api/public/settings`);
        const data = await response.json();
        setMaintenance(data);
      } catch (err) {
        console.error("Connectivity check failed");
      }
    };
    checkMaintenance();
  }, [location.pathname]);

  // Gatekeeper: Redirect to Maintenance if active, except for Admin routes
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isMaintenancePage = location.pathname === '/maintenance';
  const isLandingPage = location.pathname === '/';
  
  if (maintenance?.isMaintenanceMode && !isAdminRoute && !isMaintenancePage) {
    return <Navigate to="/maintenance" replace />;
  }

  // Global Access Block Gatekeeper: Prevent access to /app if blocked
  if (maintenance?.isArcPayBlocked && !isAdminRoute && !isLandingPage) {
    return <Navigate to="/" replace />;
  }

  // Preserve the shared link UX: if visiting root with pay_id, auto-redirect to app router
  if (isLandingPage && payId && !maintenance?.isArcPayBlocked) {
    return <Navigate to={`/app${location.search}`} replace />;
  }

  return (
    <NotificationProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<Dashboard />} />
        <Route path="/maintenance" element={<Maintenance />} />
        
        {/* Merchant Management Portal */}
        <Route path="/admin/setup" element={<AdminSetup />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <GlobalStatusSheet />
    </NotificationProvider>
  );
}
