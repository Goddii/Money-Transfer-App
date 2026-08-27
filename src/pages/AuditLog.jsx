import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Screen from '../components/Screen';
import StatusPill from '../components/StatusPill';
import Avatar from '../components/Avatar';
import { fetchAuditLog, setStatusFilter } from '../store/slices/auditSlice';

const STATUS_OPTIONS = ['All', 'Completed', 'Pending', 'Failed'];

export default function AuditLog() {
  const dispatch = useDispatch();
  const { entries, statusFilter, loading, error } = useSelector((s) => s.audit);
  const authUser = useSelector((s) => s.auth.user);

  useEffect(() => {
    dispatch(fetchAuditLog());
  }, [dispatch]);

  const filtered = useMemo(
    () => entries.filter((e) => statusFilter === 'All' || e.status === statusFilter),
    [entries, statusFilter]
  );

  const handleExport = () => {
    const rows = [
      ['Transaction ID', 'Status', 'Sender', 'Receiver', 'Amount', 'Fee', 'Time'],
      ...filtered.map((e) => [
        e.id,
        e.status,
        e.sender ?? '',
        e.receiver ?? '',
        e.amount?.toFixed?.(2) ?? e.amount,
        e.fee?.toFixed?.(2) ?? e.fee,
        e.time ?? '',
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `platform-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Screen nav="Audit Log">
      <div className="page-eyebrow">System Ledger</div>
      <div className="page-title-row">
        <div className="page-title">Audit Log</div>
        <Avatar name={authUser?.name || 'Admin'} />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <FilterChip
          label="Status"
          value={statusFilter}
          options={STATUS_OPTIONS}
          onChange={(v) => dispatch(setStatusFilter(v))}
        />
        <button className="btn btn-secondary" style={{ marginLeft: 'auto' }} onClick={handleExport} disabled={entries.length === 0}>
          Export CSV
        </button>
      </div>

      {loading && (
        <div className="card" style={{ textAlign: 'center', color: 'var(--ink-500)', fontSize: 13 }}>
          Loading audit log…
        </div>
      )}

      {!loading && error && (
        <div className="card" style={{ textAlign: 'center', color: 'var(--ink-500)', fontSize: 13 }}>
          <div style={{ marginBottom: 8 }}>{error}</div>
          <button className="btn btn-primary" onClick={() => dispatch(fetchAuditLog())}>Retry</button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: 'var(--ink-500)', fontSize: 13 }}>
          No activity yet.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {!loading &&
          !error &&
          filtered.map((e) => (
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
                <span>Amt: ${e.amount?.toFixed?.(2) ?? e.amount}</span>
                <span>Fee: ${e.fee?.toFixed?.(2) ?? e.fee}</span>
                <span>{e.time}</span>
              </div>
            </div>
          ))}
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
