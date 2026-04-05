import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';

export default function App() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const payId = searchParams.get('pay_id');

  // Preserve the shared link UX: if visiting root with pay_id, auto-redirect to app router
  if (location.pathname === '/' && payId) {
    return <Navigate to={`/app${location.search}`} replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
