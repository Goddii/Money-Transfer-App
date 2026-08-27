import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Shuffle } from 'lucide-react';
import { navItems } from './navItems';

export default function Sidebar({ active }) {
  const user = useSelector((s) => s.auth.user);
  const name = user?.name || 'Administrator';
  const role = user?.role || '';
  const avatar = user?.avatar_url || '';

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
          <div className="avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, background: 'var(--orange-500)' }}>
            {(name || 'A')[0]}
          </div>
        )}
        <div>
          <div className="sidebar-footer-name">{name}</div>
          <div className="sidebar-footer-role">{role}</div>
        </div>
      </div>
    </aside>
  );
}
