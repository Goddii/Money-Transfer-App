import UserBottomNav from './UserBottomNav';

// Responsive wrapper for user-facing pages. Provides the centered,
// width-adaptive container (.u-shell) and an optional primary navigation
// that renders as a fixed bottom bar on mobile and a sticky top bar on
// larger screens. Kept separate from the admin Screen/Sidebar so the
// user UI can be made responsive without touching the admin side.
//
// variant: 'narrow' | 'list' (omit for the default wide layout)
// nav:     true to include the primary bottom/top navigation
export default function UserShell({ nav = false, variant, style, className = '', children }) {
  const variantClass = variant ? `u-shell--${variant}` : '';
  return (
    <>
      {nav && <UserBottomNav />}
      <div className={`u-shell ${variantClass} ${className}`.trim()} style={style}>
        {children}
      </div>
    </>
  );
}
