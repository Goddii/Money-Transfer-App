import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Screen from '../../components/common/Screen';
import StatusPill from '../../components/common/StatusPill';
import Avatar from '../../components/common/Avatar';
import { fetchTransactions, setTypeFilter, setStatusFilter } from '../../features/admin/auditSlice';

export default function AuditLog() {
  const dispatch = useDispatch();
  const { entries, typeFilter, statusFilter, status } = useSelector((s) => s.audit);
  const authUser = useSelector((s) => s.auth.user);

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
    <Screen nav="Audit Log">
      <div className="page-eyebrow">System Ledger</div>
      <div className="page-title-row">
        <div className="page-title">Audit Log</div>
        <Avatar name={authUser?.name || 'Admin'} />
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
