import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Splash from './pages/Splash/Splash'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import ForgotPassword from './pages/ForgotPassword/ForgotPassword'
import Home from './pages/Home/Home'
import Deposit from './pages/Deposit/Deposit'
import SendMoney from './pages/SendMoney/SendMoney'
import TransferReview from './pages/TransferReview/TransferReview'
import TransferSuccess from './pages/TransferSuccess/TransferSuccess'
import Transactions from './pages/Transactions/Transactions'
import Profile from './pages/Profile/Profile'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/deposit" element={<ProtectedRoute><Deposit /></ProtectedRoute>} />
        <Route path="/send" element={<ProtectedRoute><SendMoney /></ProtectedRoute>} />
        <Route path="/transfer-review" element={<ProtectedRoute><TransferReview /></ProtectedRoute>} />
        <Route path="/transfer-success" element={<ProtectedRoute><TransferSuccess /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><div style={{padding:'2rem'}}>Admin - Coming soon</div></ProtectedRoute>} />
      </Routes>
    </Router>
  )
}

export default App
