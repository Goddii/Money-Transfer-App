import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import UserDetail from './pages/admin/UserDetail';
import RevenueAnalytics from './pages/admin/RevenueAnalytics';
import PlatformAnalytics from './pages/admin/PlatformAnalytics';
import AdminSettings from './pages/admin/AdminSettings';
import Login from './pages/auth/Login';
import RequireAuth from './components/common/RequireAuth';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
        <Route path="/users" element={<RequireAuth><UserManagement /></RequireAuth>} />
        <Route path="/users/:id" element={<RequireAuth><UserDetail /></RequireAuth>} />
        <Route path="/revenue" element={<RequireAuth><RevenueAnalytics /></RequireAuth>} />
        <Route path="/platform" element={<RequireAuth><PlatformAnalytics /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><AdminSettings /></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  );
}
