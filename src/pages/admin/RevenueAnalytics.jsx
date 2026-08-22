import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Screen from '../../components/common/Screen';
import Avatar from '../../components/common/Avatar';
import { fetchProfitTrends } from '../../features/admin/analyticsSlice';

export default function RevenueAnalytics() {
  const dispatch = useDispatch();
  const { trends, overview, status } = useSelector((s) => s.analytics);
  const authUser = useSelector((s) => s.auth.user);

  useEffect(() => {
    dispatch(fetchProfitTrends());
  }, [dispatch]);

  const chartData = [...trends].reverse().slice(-6);
  const maxVal = Math.max(...chartData.map((t) => t.profit), 1);
  const avgFee = overview.txVolume > 0 ? overview.collectedFees / Math.max(trends.reduce((s, t) => s + t.count, 0), 1) : 0;

  return (
    <Screen nav="Audit Log">
      <div className="page-eyebrow">Fee Analytics</div>
      <div className="page-title-row">
        <div className="page-title">Revenue</div>
        <Avatar name={authUser?.name || 'Admin'} />
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Fees Collected</div>
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
        <div className="section-title" style={{ marginTop: 0 }}>Daily Profit Trend</div>
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
    </Screen>
  );
}
