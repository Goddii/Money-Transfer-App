import { NavLink } from 'react-router-dom';
import { navItems } from './navItems';

export default function BottomNav({ active }) {
  return (
    <nav className="bottomnav">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink key={label} to={to} className={`navitem ${active === label ? 'active' : ''}`}>
          <Icon size={20} strokeWidth={2.2} />
          {label}
          <span className="navdot" />
        </NavLink>
      ))}
    </nav>
  );
}
