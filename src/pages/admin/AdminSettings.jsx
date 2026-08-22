import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ShieldCheck, Bell, Percent, Wrench, ChevronRight } from 'lucide-react';
import Screen from '../../components/common/Screen';
import StatusPill from '../../components/common/StatusPill';
import Avatar from '../../components/common/Avatar';
import { fetchTransactions, setTypeFilter, setStatusFilter } from '../../features/admin/auditSlice';
import { logout } from '../../features/auth/authSlice';

export default function AdminSettings() {
  const dispatch = useDispatch();
  const { entries, typeFilter, statusFilter, status } = useSelector((s) => s.audit);
  const authUser = useSelector((s) => s.auth.user);
  const [maintenance, setMaintenance] = useState(false);

  useEffect(() => {
    dispatch(fetchTransactions());
  }, [dispatch]);

  const filtered = useMemo(
    () =>
      entries.filter((e) => {
        const matchesType = typeFilter === 'All' || e.type === typeFilter;
        const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
        return matchesType && matchesStatus;
      }),
    [entries, typeFilter, statusFilter]
  );

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

      <div className="page-eyebrow">System Ledger</div>
      <div className="page-title-row">
        <div className="page-title" style={{ fontSize: 20 }}>Audit Log</div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <FilterChip
          label="Type"
          value={typeFilter}
          options={['All', 'transfer', 'deposit', 'fee']}
          onChange={(v) => dispatch(setTypeFilter(v))}
        />
        <FilterChip
          label="Status"
          value={statusFilter}
          options={['All', 'Completed', 'Pending', 'Failed']}
          onChange={(v) => dispatch(setStatusFilter(v))}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {status === 'loading' && (
          <div className="card" style={{ textAlign: 'center', color: 'var(--ink-500)', fontSize: 13 }}>Loading...</div>
        )}
        {status !== 'loading' && filtered.length === 0 && (
          <div className="card" style={{ textAlign: 'center', color: 'var(--ink-500)', fontSize: 13 }}>
            No activity yet.
          </div>
        )}
        {filtered.map((e) => (
          <div key={e.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 800 }}>{e.id}</span>
              <StatusPill status={e.status} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <div className="stat-label">Sender Wallet</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>#{e.senderWalletId ?? '—'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="stat-label">Receiver Wallet</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>#{e.receiverWalletId ?? '—'}</div>
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
        <ConfigRow icon={Percent} label="Fee Settings" />
        <div className="list-row">
          <div className="list-left">
            <Wrench size={17} color="var(--ink-500)" />
            <span className="row-title">Maintenance Mode</span>
          </div>
          <button className={`toggle ${maintenance ? 'on' : ''}`} onClick={() => setMaintenance((v) => !v)} />
        </div>
        <button className="btn btn-danger-soft btn-block" style={{ marginTop: 14 }} onClick={() => dispatch(logout())}>
          Log Out
        </button>
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
