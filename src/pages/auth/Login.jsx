import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../../features/auth/authSlice';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((s) => s.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)' }}>
      <form onSubmit={handleSubmit} className="card" style={{ width: 340, padding: 28 }}>
        <div className="page-title" style={{ marginBottom: 4 }}>Admin Login</div>
        <div className="row-sub" style={{ marginBottom: 20 }}>Sign in to Vyloc Admin</div>

        {error && (
          <div className="pill pill-red" style={{ marginBottom: 14, display: 'block', width: '100%', textAlign: 'center', padding: '8px 0' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          <div className="stat-label" style={{ marginBottom: 6 }}>Email</div>
          <div className="search-bar">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@vyloc.com" />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div className="stat-label" style={{ marginBottom: 6 }}>Password</div>
          <div className="search-bar">
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
        </div>

        <button className="btn btn-primary btn-block" type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
