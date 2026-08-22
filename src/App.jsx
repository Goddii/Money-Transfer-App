import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Splash from './pages/Splash/Splash'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import ForgotPassword from './pages/ForgotPassword/ForgotPassword'
import AdminDashboard from './pages/AdminDashboard'
import AdminSettings from './pages/AdminSettings'
import PlatformAnalytics from './pages/PlatformAnalytics'
import RevenueAnalytics from './pages/RevenueAnalytics'
import UserManagement from './pages/UserManagement'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/platform" element={<PlatformAnalytics />} />
        <Route path="/admin/revenue" element={<RevenueAnalytics />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
