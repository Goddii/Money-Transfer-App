import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Screen from '../../components/common/Screen';
import Avatar from '../../components/common/Avatar';
import { fetchProfitTrends } from '../../features/admin/analyticsSlice';
import { fetchTransactions } from '../../features/admin/auditSlice';

const TYPE_LABELS = {
  transfer: 'P2P Transfer Fees',
  deposit: 'Deposit Surcharge',
  fee: 'Platform Fees',
};

export default function RevenueAnalytics() {
  const dispatch = useDispatch();
  const { trends, overview, status } = useSelector((s) => s.analytics);
  const { entries: transactions } = useSelector((s) => s.audit);
  const authUser = useSelector((s) => s.auth.user);

  useEffect(() => {
    dispatch(fetchProfitTrends());
    dispatch(fetchTransactions());
  }, [dispatch]);

  const chartData = [...trends].reverse().slice(-6);
  const maxVal = Math.max(...chartData.map((t) => t.profit), 1);
  const avgFee = overview.txVolume > 0 ? overview.collectedFees / Math.max(trends.reduce((s, t) => s + t.count, 0), 1) : 0;

  const bySource = useMemo(() => {
    const totals = {};
    let grandTotal = 0;
    transactions.forEach((t) => {
      const key = t.type || 'other';
      totals[key] = (totals[key] || 0) + t.fee;
      grandTotal += t.fee;
    });
    return Object.entries(totals)
      .map(([type, amount]) => ({
        label: TYPE_LABELS[type] || `${type.charAt(0).toUpperCase()}${type.slice(1)} Fees`,
        amount,
        pct: grandTotal > 0 ? Math.round((amount / grandTotal) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  return (
    <Screen nav="Audit Log">
      <div className="page-eyebrow">Fee Analytics</div>
      <div className="page-title-row">
        <div className="page-title">Revenue</div>
        <Avatar name={authUser?.name || 'Admin'} />
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">This Month Revenue</div>
          <div className="stat-value" style={{ color: 'var(--orange-600)' }}>
            ${overview.collectedFees.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Fee / TX</div>
          <div className="stat-value">${avgFee.toFixed(2)}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="section-title" style={{ marginTop: 0 }}>Revenue Trend (6 months)</div>
        {status === 'loading' && (
          <div style={{ padding: '10px 0', textAlign: 'center', color: 'var(--ink-500)', fontSize: 13 }}>Loading...</div>
        )}
        {status !== 'loading' && chartData.length === 0 && (
          <div style={{ padding: '10px 0', textAlign: 'center', color: 'var(--ink-500)', fontSize: 13 }}>
            No revenue recorded yet.
          </div>
        )}
        {chartData.length > 0 && (
          <div className="bar-chart">
            {chartData.map((t) => (
              <div className="bar-col" key={t.date}>
                <div
                  className={`bar ${t.profit === maxVal ? 'peak' : ''}`}
                  style={{ height: `${(t.profit / maxVal) * 90}px` }}
                />
                <div className="bar-month">{new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="section-title">Revenue by Source</div>
      <div className="card">
        {bySource.length === 0 && (
          <div style={{ padding: '8px 0', textAlign: 'center', color: 'var(--ink-500)', fontSize: 13 }}>
            No revenue recorded yet.
          </div>
        )}
        {bySource.map((s, i) => (
          <div key={s.label} style={{ marginBottom: i === bySource.length - 1 ? 0 : 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
              <span style={{ fontWeight: 700 }}>{s.label}</span>
              <span style={{ color: 'var(--ink-500)', fontWeight: 600 }}>
                ${s.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({s.pct}%)
              </span>
            </div>
            <div style={{ height: 6, background: 'var(--surface)', borderRadius: 99 }}>
              <div style={{ width: `${s.pct}%`, height: '100%', background: 'var(--orange-500)', borderRadius: 99 }} />
            </div>
          </div>
        ))}
      </div>
    </Screen>
  );
}
