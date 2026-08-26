import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ShieldCheck, Bell, Percent, Wrench, Download, ChevronRight } from 'lucide-react';
import Screen from '../../components/common/Screen';
import Avatar from '../../components/common/Avatar';
import { fetchTransactions } from '../../features/admin/auditSlice';
import { logout } from '../../features/auth/authSlice';

export default function AdminSettings() {
  const dispatch = useDispatch();
  const { entries } = useSelector((s) => s.audit);
  const authUser = useSelector((s) => s.auth.user);
  const [maintenance, setMaintenance] = useState(false);

  useEffect(() => {
    dispatch(fetchTransactions());
  }, [dispatch]);

  const handleExport = () => {
    const rows = [
      ['Transaction ID', 'Status', 'Type', 'Sender Wallet', 'Receiver Wallet', 'Amount', 'Fee', 'Time'],
      ...entries.map((e) => [e.id, e.status, e.type, e.senderWalletId ?? '', e.receiverWalletId ?? '', e.amount, e.fee, e.time]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `platform-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Screen nav="Settings">
      <div className="page-eyebrow">Configuration</div>
      <div className="page-title-row">
        <div className="page-title">Settings</div>
      </div>

      <div className="card" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar name={authUser?.name || 'Admin'} size={44} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>{authUser?.name || 'Admin'}</div>
          <div className="row-sub">{authUser?.email}</div>
        </div>
        <span className="pill pill-orange">{authUser?.role?.toUpperCase() || 'ADMIN'}</span>
      </div>

      <div className="section-title" style={{ marginTop: 0 }}>General Configuration</div>
      <div className="card">
        <ConfigRow icon={ShieldCheck} label="Account Security" />
        <ConfigRow icon={Bell} label="Notifications" />
        <ConfigRow icon={Percent} label="Fee Settings" />
        <div className="list-row">
          <div className="list-left">
            <Wrench size={17} color="var(--ink-500)" />
            <span className="row-title">Maintenance Mode</span>
          </div>
          <button className={`toggle ${maintenance ? 'on' : ''}`} onClick={() => setMaintenance((v) => !v)} />
        </div>
        <button className="list-row" style={{ width: '100%', textAlign: 'left' }} onClick={handleExport}>
          <div className="list-left">
            <Download size={17} color="var(--ink-500)" />
            <span className="row-title">Export Platform Audit</span>
          </div>
          <ChevronRight size={16} color="var(--ink-300)" />
        </button>
        <button className="btn btn-danger-soft btn-block" style={{ marginTop: 14 }} onClick={() => dispatch(logout())}>
          Log Out Administrator
        </button>
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
