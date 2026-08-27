import { useState } from 'react';
import { useSelector } from 'react-redux';
import { ShieldCheck, Bell, Percent, Wrench, ChevronRight } from 'lucide-react';
import Screen from '../components/Screen';
import Avatar from '../components/Avatar';

export default function AdminSettings() {
  const authUser = useSelector((s) => s.auth.user);
  const [maintenance, setMaintenance] = useState(false);

  const name = authUser?.name || 'Admin';
  const email = authUser?.email || '';
  const role = authUser?.role?.toUpperCase() || 'ADMIN';

  return (
    <Screen nav="Settings">
      <div className="page-eyebrow">Configuration</div>
      <div className="page-title-row">
        <div className="page-title">Settings</div>
        <Avatar name={name} />
      </div>

      <div className="card" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar name={name} size={44} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>{name}</div>
          <div className="row-sub">{email}</div>
        </div>
        <span className="pill pill-orange">{role}</span>
      </div>

      <div className="section-title" style={{ marginTop: 0 }}>General Configuration</div>
      <div className="card">
        <ConfigRow icon={ShieldCheck} label="Account Security" />
        <ConfigRow icon={Bell} label="Notifications" />
        <ConfigRow icon={Percent} label="Fee Settings" trailing="0.25% fixed" />
        <div className="list-row">
          <div className="list-left">
            <Wrench size={17} color="var(--ink-500)" />
            <span className="row-title">Maintenance Mode</span>
          </div>
          <button className={`toggle ${maintenance ? 'on' : ''}`} onClick={() => setMaintenance((v) => !v)} />
        </div>
      </div>
    </Screen>
  );
}

function ConfigRow({ icon: Icon, label, trailing }) {
  return (
    <div className="list-row">
      <div className="list-left">
        <Icon size={17} color="var(--ink-500)" />
        <span className="row-title">{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {trailing && <span className="row-sub" style={{ margin: 0 }}>{trailing}</span>}
        <ChevronRight size={16} color="var(--ink-300)" />
      </div>
    </div>
  );
}
