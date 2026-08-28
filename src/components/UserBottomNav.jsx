import { useNavigate, useLocation } from 'react-router-dom';

// Primary navigation for normal user pages. Preserves the original
// mobile bottom-bar behaviour and evolves into a sticky top bar on
// laptop/desktop (see .u-nav rules in index.css). It is intentionally
// NOT a sidebar, to avoid turning the user app into an admin dashboard.
const ITEMS = [
  { to: '/home', label: 'Home', icon: '🏠' },
  { to: '/send', label: 'Send', icon: '↗' },
  { to: '/transactions', label: 'History', icon: '🕐' },
  { to: '/profile', label: 'Profile', icon: '👤' },
];

export default function UserBottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  function isActive(to) {
    return pathname === to || pathname.startsWith(to + '/');
  }

  return (
    <nav className="u-nav" aria-label="Primary">
      <div className="u-nav-inner">
        <div className="u-nav-brand">
          <span className="u-nav-logo" aria-hidden="true">⚡</span>
          Vyloc
        </div>
        <div className="u-nav-links">
          {ITEMS.map((it) => {
            const active = isActive(it.to);
            return (
              <button
                key={it.to}
                type="button"
                onClick={() => navigate(it.to)}
                className={`u-nav-link ${active ? 'active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <span className="u-nav-ico" aria-hidden="true">{it.icon}</span>
                <span>{it.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
