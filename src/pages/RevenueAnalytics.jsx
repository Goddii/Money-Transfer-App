import { useDispatch, useSelector } from 'react-redux';
import Screen from '../components/Screen';
import { fetchRevenue } from '../store/slices/analyticsSlice';
import { useEffect } from 'react';
import { formatKES } from '../utils/format';

const centerStyle = {
  padding: '40px 0',
  textAlign: 'center',
  color: 'var(--ink-500)',
  fontSize: 14,
};

export default function RevenueAnalytics() {
  const dispatch = useDispatch();
  const { revenue, revenueLoading, revenueError } = useSelector((s) => s.analytics);
  const adminUser = useSelector((s) => s.auth.user);
  const maxVal = Math.max(...revenue.trend.map((t) => t.value), 1);
  const totalRevenue = revenue.monthRevenue;
  const avgMonthly = revenue.trend.length ? totalRevenue / revenue.trend.length : 0;

  useEffect(() => {
    dispatch(fetchRevenue());
  }, [dispatch]);

  if (revenueError) {
    return (
      <Screen nav="Revenue">
        <div style={centerStyle}>
          <div className="page-title" style={{ marginBottom: 8 }}>Unable to load revenue</div>
          <div style={{ fontSize: 13 }}>{revenueError}</div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => dispatch(fetchRevenue())}>Retry</button>
        </div>
      </Screen>
    );
  }

  if (revenueLoading) {
    return (
      <Screen nav="Revenue">
        <div style={centerStyle}>Loading revenue…</div>
      </Screen>
    );
  }

  const avatar = adminUser?.avatar_url || '';
  const name = [adminUser?.first_name, adminUser?.last_name].filter(Boolean).join(' ') || adminUser?.name || 'Administrator';

  return (
    <Screen nav="Revenue">
      <div className="page-eyebrow">Fee Analytics</div>
      <div className="page-title-row">
        <div className="page-title">Revenue</div>
        {avatar ? (
          <img className="avatar" src={avatar} alt={name} />
        ) : (
          <div className="avatar" style={{ background: 'var(--emerald-50)', color: 'var(--emerald-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
            {(name || 'A')[0]}
          </div>
        )}
      </div>

      <div style={{ fontSize: 12.5, color: 'var(--ink-500)', fontWeight: 600, marginBottom: 12 }}>
        Monthly revenue trend
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value" style={{ color: 'var(--emerald-600)' }}>
            {formatKES(totalRevenue)}
          </div>
          <div className="stat-delta up">{revenue.monthRevenueDelta}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg / Month</div>
          <div className="stat-value">{formatKES(avgMonthly)}</div>
          <div className="stat-delta flat">{revenue.avgFeeNote}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="section-title" style={{ marginTop: 0 }}>Revenue Trend (6 months)</div>
        <div className="bar-chart">
          {revenue.trend.map((t) => (
            <div className="bar-col" key={t.month}>
              <div
                className={`bar ${t.value === maxVal ? 'peak' : ''}`}
                style={{ height: `${(t.value / maxVal) * 90}px` }}
              />
              <div className="bar-month">{t.month}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="section-title">Revenue by Source</div>
      <div className="card">
        {revenue.bySource.length === 0 && (
          <div style={{ padding: '8px 0', textAlign: 'center', color: 'var(--ink-500)', fontSize: 13 }}>
            No revenue recorded yet.
          </div>
        )}
        {revenue.bySource.map((s, i) => (
          <div key={s.label} style={{ marginBottom: i === revenue.bySource.length - 1 ? 0 : 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
              <span style={{ fontWeight: 700 }}>{s.label}</span>
              <span style={{ color: 'var(--ink-500)', fontWeight: 600 }}>
                {formatKES(s.amount)} ({s.pct}%)
              </span>
            </div>
            <div style={{ height: 6, background: 'var(--surface)', borderRadius: 99 }}>
              <div style={{ width: `${s.pct}%`, height: '100%', background: 'var(--emerald-500)', borderRadius: 99 }} />
            </div>
          </div>
        ))}
      </div>
    </Screen>
  );
}