import { NavLink } from 'react-router-dom';
import { Shuffle } from 'lucide-react';
import { navItems } from './navItems';
import { admin } from '../mockData';

export default function Sidebar({ active }) {
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
        <img className="avatar" src={admin.avatar} alt={admin.name} />
        <div>
          <div className="sidebar-footer-name">{admin.name}</div>
          <div className="sidebar-footer-role">{admin.role}</div>
        </div>
      </div>
    </aside>
  );
}
