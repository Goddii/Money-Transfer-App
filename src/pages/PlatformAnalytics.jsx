import { useSelector } from 'react-redux';
import Screen from '../components/Screen';
import { admin } from '../mockData';

export default function PlatformAnalytics() {
  const { platform } = useSelector((s) => s.analytics);
  const maxGrowth = Math.max(...platform.growthCurve);

  return (
    <Screen nav="Dashboard">
      <div className="page-eyebrow">Ecosystem Health</div>
      <div className="page-title-row">
        <div className="page-title">Platform Stats</div>
        <img className="avatar" src={admin.avatar} alt={admin.name} />
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div className="stat-label">Platform Vol. (Monthly)</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <div className="stat-value" style={{ fontSize: 26 }}>${platform.volumeMonthly}M</div>
          <span className="stat-delta up">{platform.volumeDelta}</span>
        </div>
      </div>

      <div className="stat-grid">
        <StatBlock label="New Users (Mo)" value={platform.newUsersMo.toLocaleString()} note={platform.newUsersNote} />
        <StatBlock label="Avg TX Size" value={`$${platform.avgTxSize}`} note={platform.avgTxSizeNote} />
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="section-title" style={{ marginTop: 0 }}>User Growth Curve (Mo)</div>
        <svg viewBox="0 0 300 70" width="100%" height="70" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="var(--orange-500)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={platform.growthCurve
              .map((v, i) => `${(i / (platform.growthCurve.length - 1)) * 300},${70 - (v / maxGrowth) * 62}`)
              .join(' ')}
          />
        </svg>
      </div>

      <div className="section-title">Most Active Users</div>
      <div className="card">
        {platform.mostActive.map((u, i) => (
          <div key={u.name} className="list-row">
            <div className="list-left">
              <span
                style={{
                  width: 22, height: 22, borderRadius: 6, background: 'var(--orange-50)', color: 'var(--orange-600)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800,
                }}
              >
                {u.rank}
              </span>
              <div>
                <div className="row-title">{u.name}</div>
                <div className="row-sub">{u.tx} txs</div>
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--orange-600)' }}>{u.volume} volume</div>
          </div>
        ))}
      </div>
    </Screen>
  );
}

function StatBlock({ label, value, note }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-delta flat">{note}</div>
    </div>
  );
}
