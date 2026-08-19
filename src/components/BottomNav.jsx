import { NavLink } from 'react-router-dom';
import { LayoutGrid, Users, ScrollText, Settings } from 'lucide-react';

const items = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/settings', label: 'Audit Log', icon: ScrollText },
  { to: '/settings', label: 'Settings', icon: Settings },
];

// Bottom tab bar reused across every admin screen. "Audit Log" and "Settings"
// both live on the combined Settings page per the Figma flow, so both tabs
// route there; the "active" prop mirrors whichever icon each mock highlights.
export default function BottomNav({ active }) {
  return (
    <nav className="bottomnav">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink key={label} to={to} className={`navitem ${active === label ? 'active' : ''}`}>
          <Icon size={20} strokeWidth={2.2} />
          {label}
          <span className="navdot" />
        </NavLink>
      ))}
    </nav>
  );
}
