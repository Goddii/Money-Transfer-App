import { useDispatch, useSelector } from 'react-redux';
import Screen from '../components/Screen';
import { setRevenueRange } from '../store/slices/analyticsSlice';
import { admin } from '../mockData';

export default function RevenueAnalytics() {
  const dispatch = useDispatch();
  const { revenue, revenueRange } = useSelector((s) => s.analytics);
  const maxVal = Math.max(...revenue.trend.map((t) => t.value));

  return (
    <Screen nav="Audit Log">
      <div className="page-eyebrow">Fee Analytics</div>
      <div className="page-title-row">
        <div className="page-title">Revenue</div>
        <img className="avatar" src={admin.avatar} alt={admin.name} />
      </div>

      <div className="segment">
        {['Week', 'Month', 'Quarter', 'Year'].map((r) => (
          <button key={r} className={revenueRange === r ? 'active' : ''} onClick={() => dispatch(setRevenueRange(r))}>
            {r}
          </button>
        ))}
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">This Month Revenue</div>
          <div className="stat-value" style={{ color: 'var(--orange-600)' }}>
            ${revenue.monthRevenue.toLocaleString()}
          </div>
          <div className="stat-delta up">{revenue.monthRevenueDelta}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Fee / TX</div>
          <div className="stat-value">${revenue.avgFee.toFixed(2)}</div>
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
        {revenue.bySource.map((s, i) => (
          <div key={s.label} style={{ marginBottom: i === revenue.bySource.length - 1 ? 0 : 14 }}>
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
