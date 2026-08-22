import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Shuffle } from 'lucide-react';
import { navItems } from './navItems';
import Avatar from '../common/Avatar';

export default function Sidebar({ active }) {
  const authUser = useSelector((s) => s.auth.user);

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
        <Avatar name={authUser?.name || 'Admin'} size={34} />
        <div>
          <div className="sidebar-footer-name">{authUser?.name || 'Admin'}</div>
          <div className="sidebar-footer-role">{authUser?.role?.toUpperCase() || ''}</div>
        </div>
      </div>
    </aside>
  );
}
