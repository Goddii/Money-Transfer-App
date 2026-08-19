import StatusBar from './StatusBar';
import BottomNav from './BottomNav';

// Shared device chrome: status bar + scrollable body + bottom nav.
// Every admin page renders inside this so the set behaves like one app.
export default function Screen({ children, nav }) {
  return (
    <div className="device">
      <StatusBar />
      <div className="screen">{children}</div>
      {nav && <BottomNav active={nav} />}
      <div className="home-indicator" />
    </div>
  );
}
