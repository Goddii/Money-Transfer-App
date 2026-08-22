import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronDown, ShieldCheck, Bell, Percent, Wrench, ChevronRight } from 'lucide-react';
import Screen from '../components/Screen';
import StatusPill from '../components/StatusPill';
import { setTypeFilter, setStatusFilter, fetchAuditLog } from '../store/slices/auditSlice';
import { admin } from '../mockData';

const centerStyle = {
  padding: '40px 0',
  textAlign: 'center',
  color: 'var(--ink-500)',
  fontSize: 14,
};

export default function AdminSettings() {
  const dispatch = useDispatch();
  const { entries, typeFilter, statusFilter, loading, error } = useSelector((s) => s.audit);
  const [maintenance, setMaintenance] = useState(false);

  useEffect(() => {
    dispatch(fetchAuditLog());
  }, [dispatch]);

  if (error) {
    return (
      <Screen nav="Settings">
        <div style={centerStyle}>
          <div className="page-title" style={{ marginBottom: 8 }}>Unable to load audit log</div>
          <div style={{ fontSize: 13 }}>{error}</div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => dispatch(fetchAuditLog())}>Retry</button>
        </div>
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen nav="Settings">
        <div style={centerStyle}>Loading audit log…</div>
      </Screen>
    );
  }

  return (
    <Screen nav="Settings">
      <div className="page-eyebrow">Configuration</div>
      <div className="page-title-row">
        <div className="page-title">Settings</div>
      </div>

      <div className="card" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
        <img className="avatar" style={{ width: 44, height: 44 }} src={admin.avatar} alt={admin.name} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>Super Admin User</div>
          <div className="row-sub">admin@vyloo.com</div>
        </div>
        <span className="pill pill-orange">ROOT</span>
      </div>

      <div className="page-eyebrow">System Ledger</div>
      <div className="page-title-row">
        <div className="page-title" style={{ fontSize: 20 }}>Audit Log</div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <FilterChip
          label="Type"
          value={typeFilter}
          options={['All', 'Transfer', 'Deposit', 'Fee']}
          onChange={(v) => dispatch(setTypeFilter(v))}
        />
        <FilterChip
          label="Status"
          value={statusFilter}
          options={['Active', 'Completed', 'Pending', 'Failed']}
          onChange={(v) => dispatch(setStatusFilter(v))}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {entries.length === 0 && (
          <div className="card" style={{ textAlign: 'center', color: 'var(--ink-500)', fontSize: 13 }}>
            No activity yet.
          </div>
        )}
        {entries.map((e) => (
          <div key={e.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 800 }}>{e.id}</span>
              <StatusPill status={e.status} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <div className="stat-label">Sender</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{e.sender}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="stat-label">Receiver</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{e.receiver}</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-500)', fontWeight: 600 }}>
              <span>Amt: ${e.amount.toFixed(2)}</span>
              <span>Fee: ${e.fee.toFixed(2)}</span>
              <span>{e.time}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="section-title">General Configuration</div>
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

function FilterChip({ label, value, options, onChange }) {
  return (
    <select className="select-chip" value={value} onChange={(e) => onChange(e.target.value)} style={{ appearance: 'none' }}>
      {options.map((o) => (
        <option key={o} value={o}>
          {label}: {o}
        </option>
      ))}
    </select>
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