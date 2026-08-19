import { Wifi, BatteryFull, Signal } from 'lucide-react';

// Cosmetic iOS-style status bar so each screen reads as a real mobile frame,
// matching the Figma mockups (9:41 / signal / wifi / battery).
export default function StatusBar() {
  return (
    <div className="statusbar">
      <span>9:41</span>
      <span className="icons">
        <Signal size={14} />
        <Wifi size={14} />
        <BatteryFull size={16} />
      </span>
    </div>
  );
}
