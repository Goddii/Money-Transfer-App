import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import UserDetail from './pages/UserDetail';
import RevenueAnalytics from './pages/RevenueAnalytics';
import PlatformAnalytics from './pages/PlatformAnalytics';
import AdminSettings from './pages/AdminSettings';

// Admin-only route table. Six screens, mirroring the six Figma frames:
// admin-dashboard, user-management, user-detail, revenue-analytics,
// platform-analytics, admin-settings (settings + audit log + config).
export default function App() {
  return (
    <BrowserRouter>
      <div className="canvas">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/users/:id" element={<UserDetail />} />
          <Route path="/revenue" element={<RevenueAnalytics />} />
          <Route path="/platform" element={<PlatformAnalytics />} />
          <Route path="/settings" element={<AdminSettings />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
