import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Splash from './pages/Splash/Splash'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import ForgotPassword from './pages/ForgotPassword/ForgotPassword'

function ComingSoon({ title }) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a1a', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
        <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>{title}</h1>
        <p style={{ color: '#8899aa' }}>This section is coming soon.</p>
      </div>
    )
  }
