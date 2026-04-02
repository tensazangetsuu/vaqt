import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useLang } from './context/LangContext';

import Login           from './pages/Login';
import Register        from './pages/Register';
import Dashboard       from './pages/Dashboard';
import Profile         from './pages/Profile';
import Services        from './pages/Services';
import Bookings        from './pages/Bookings';
import BookingPage     from './pages/BookingPage';
import BookingConfirm  from './pages/BookingConfirm';
import DashboardLayout from './components/DashboardLayout';

function RequireAuth({ children }) {
  const { business, loading } = useAuth();
  const { t } = useLang();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <span className="text-xl text-espresso/50">{t('loading')}</span>
    </div>
  );
  if (!business) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/book/:slug"         element={<BookingPage />} />
      <Route path="/book/:slug/confirm" element={<BookingConfirm />} />

      <Route path="/dashboard" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
        <Route index          element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="services" element={<Services />} />
        <Route path="bookings" element={<Bookings />} />
      </Route>

      <Route path="/"  element={<Navigate to="/dashboard" replace />} />
      <Route path="*"  element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
