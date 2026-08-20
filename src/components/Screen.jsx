import BottomNav from './BottomNav';
import Sidebar from './Sidebar';

export default function Screen({ children, nav }) {
  return (
    <div className="app-shell">
      <Sidebar active={nav} />
      <div className="main-col">
        <div className="screen">{children}</div>
        {nav && <BottomNav active={nav} />}
      </div>
    </div>
  );
}
