import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AdminSetup from './pages/AdminSetup';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Maintenance from './pages/Maintenance';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Docs from './pages/Docs';
import DevDocs from './pages/DevDocs';
import { Toaster as SonnerToaster } from 'sonner'; // Will be removed in next pass
import { useState, useEffect } from 'react';

import { NotificationProvider } from './context/NotificationContext';
import GlobalStatusSheet from './components/shared/GlobalStatusSheet';

export default function App() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const payId = searchParams.get('pay_id');
  const [maintenance, setMaintenance] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/api/public/settings`);
        const data = await response.json();
        setMaintenance(data);
      } catch (err) {
        console.error("Connectivity check failed");
      } finally {
        setIsReady(true);
      }
    };
    checkMaintenance();
  }, [location.pathname]);

  // Gatekeeper Constants
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isMaintenancePage = location.pathname === '/maintenance';
  const isLandingPage = location.pathname === '/';
  const isTermsPage = location.pathname === '/terms-and-conditions';
  const isPrivacyPage = location.pathname === '/privacy-policy';
  const isDocsPage = location.pathname === '/docs';
  const isDevPage = location.pathname === '/developer';

  // Security Shield: Prevent flash of content during checks
  if (!isReady && !isMaintenancePage && !isTermsPage && !isPrivacyPage && !isDocsPage && !isDevPage) {
    return <div className="min-h-screen bg-[#050505]"></div>;
  }

  // Hierarchical Access Gatekeepers
  if (!isAdminRoute && maintenance) {
    if (maintenance.isMaintenanceMode) {
      if (!isMaintenancePage && !isTermsPage && !isPrivacyPage && !isDocsPage && !isDevPage) {
        return <Navigate to="/maintenance" replace />;
      }
    } else if (maintenance.isArcPayBlocked) {
      if (!isLandingPage && !isMaintenancePage && !isTermsPage && !isPrivacyPage && !isDocsPage && !isDevPage) {
        return <Navigate to="/" replace />;
      }



    } else {
      // Normal Execution
      if (isLandingPage && payId) {
        return <Navigate to={`/app${location.search}`} replace />;
      }
    }
  }

  return (
    <NotificationProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<Dashboard />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/terms-and-conditions" element={<Terms />} />
        <Route path="/privacy-policy" element={<Privacy />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/developer" element={<DevDocs />} />

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
