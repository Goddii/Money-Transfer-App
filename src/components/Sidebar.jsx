import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Shuffle, LogOut } from 'lucide-react';
import { navItems } from './navItems';
import { logout } from '../store/authSlice';

export default function Sidebar({ active }) {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const name =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
    user?.name ||
    'Administrator';
  const role = user?.role || '';
  const avatar = user?.avatar_url || '';

  function handleLogout() {
    // Reuses the single shared authSlice logout action so admin logout has the
    // same effect as user logout: token + user state cleared, redirect to login.
    dispatch(logout());
    // replace: true so Back cannot return to an authenticated admin screen.
    window.location.assign('/login');
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-icon">
          <Shuffle size={18} />
        </span>
        Vyloc Admin
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={label} to={to} className={`sidebar-link ${active === label ? 'active' : ''}`}>
            <Icon size={18} strokeWidth={2.2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {avatar ? (
          <img className="avatar" src={avatar} alt={name} />
        ) : (
          <div className="avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, background: 'var(--emerald-500)' }}>
            {(name || 'A')[0]}
          </div>
        )}
        <div>
          <div className="sidebar-footer-name">{name}</div>
          <div className="sidebar-footer-role">{role}</div>
        </div>
      </div>

      <div className="sidebar-account-actions">
        <button
          type="button"
          onClick={handleLogout}
          className="sidebar-logout"
          aria-label="Log out of admin account"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
