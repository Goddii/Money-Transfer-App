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
import UserDetail from './pages/UserDetail'
import Home from './pages/Home/Home'
import Deposit from './pages/Deposit/Deposit'
import SendMoney from './pages/SendMoney/SendMoney'
import TransferReview from './pages/TransferReview/TransferReview'
import TransferSuccess from './pages/TransferSuccess/TransferSuccess'
import Transactions from './pages/Transactions/Transactions'
import Beneficiaries from './pages/Beneficiaries/Beneficiaries'
import Profile from './pages/Profile/Profile'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/deposit" element={<ProtectedRoute><Deposit /></ProtectedRoute>} />
        {/* Authenticated user routes. These must be declared explicitly:
            before they existed, /send, /transactions and /beneficiaries fell
            through to the "*" catch-all below and redirected to Splash. */}
        <Route path="/send" element={<ProtectedRoute><SendMoney /></ProtectedRoute>} />
        <Route path="/transfer-review" element={<ProtectedRoute><TransferReview /></ProtectedRoute>} />
        <Route path="/transfer-success" element={<ProtectedRoute><TransferSuccess /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        <Route path="/beneficiaries" element={<ProtectedRoute><Beneficiaries /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute adminOnly><AdminSettings /></ProtectedRoute>} />
        <Route path="/admin/platform" element={<ProtectedRoute adminOnly><PlatformAnalytics /></ProtectedRoute>} />
        <Route path="/admin/revenue" element={<ProtectedRoute adminOnly><RevenueAnalytics /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute adminOnly><UserManagement /></ProtectedRoute>} />
        <Route path="/admin/users/:id" element={<ProtectedRoute adminOnly><UserDetail /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
