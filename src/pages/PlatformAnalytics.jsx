import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import Screen from '../components/Screen';
import { fetchPlatform } from '../store/slices/analyticsSlice';
import { formatKES } from '../utils/format';

export default function PlatformAnalytics() {
  const dispatch = useDispatch();
  const { platform, platformLoaded, platformLoading, platformError } = useSelector((s) => s.analytics);
  const adminUser = useSelector((s) => s.auth.user);

  useEffect(() => {
    dispatch(fetchPlatform());
  }, [dispatch]);

  const avatar = adminUser?.avatar_url || '';
  const name = [adminUser?.first_name, adminUser?.last_name].filter(Boolean).join(' ') || adminUser?.name || 'Administrator';

  if (platformError) {
    return (
      <Screen nav="Dashboard">
        <div className="page-eyebrow">Ecosystem Health</div>
        <div className="page-title-row">
          <div className="page-title">Platform Stats</div>
          {avatar ? (
            <img className="avatar" src={avatar} alt={name} />
          ) : (
            <div className="avatar" style={{ background: 'var(--emerald-50)', color: 'var(--emerald-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
              {(name || 'A')[0]}
            </div>
          )}
        </div>
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--ink-500)', fontSize: 14 }}>
          <div className="page-title" style={{ marginBottom: 8, fontSize: 16 }}>Unable to load platform analytics</div>
          <div style={{ fontSize: 13 }}>{platformError}</div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => dispatch(fetchPlatform())}>Retry</button>
        </div>
      </Screen>
    );
  }

  if (platformLoading || !platformLoaded) {
    return (
      <Screen nav="Dashboard">
        <div className="page-eyebrow">Ecosystem Health</div>
        <div className="page-title-row">
          <div className="page-title">Platform Stats</div>
          {avatar ? (
            <img className="avatar" src={avatar} alt={name} />
          ) : (
            <div className="avatar" style={{ background: 'var(--emerald-50)', color: 'var(--emerald-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
              {(name || 'A')[0]}
            </div>
          )}
        </div>
        <div className="card" style={{ textAlign: 'center', color: 'var(--ink-500)', fontSize: 13, padding: '24px 0' }}>
          Loading platform analytics…
        </div>
      </Screen>
    );
  }

  return (
    <Screen nav="Dashboard">
      <div className="page-eyebrow">Ecosystem Health</div>
      <div className="page-title-row">
        <div className="page-title">Platform Stats</div>
        <img className="avatar" src={avatar} alt={name} />
      </div>

      <PlatformContent platform={platform} />
    </Screen>
  );
}

function PlatformContent({ platform }) {
  const curve = platform.growthCurve || [];
  const maxGrowth = Math.max(1, ...curve.map((c) => Number(c.value) || 0));
  const delta = platform.volumeDelta;
  const deltaText = delta == null ? '—' : `${delta > 0 ? '▲' : delta < 0 ? '▼' : ''} ${Math.abs(delta).toFixed(1)}%`;
  const deltaClass = delta == null ? 'flat' : delta >= 0 ? 'up' : 'down';

  return (
    <>
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="stat-label">Platform Volume (Monthly)</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <div className="stat-value" style={{ fontSize: 26 }}>{formatKES(platform.volumeMonthly)}</div>
          <span className={`stat-delta ${deltaClass}`}>{deltaText}</span>
        </div>
      </div>

      <div className="stat-grid">
        <StatBlock label="New Users (Mo)" value={(platform.newUsersMo ?? 0).toLocaleString()} note={platform.newUsersNote} />
        <StatBlock label="Avg TX Size" value={formatKES(platform.avgTxSize)} note={platform.avgTxSizeNote} />
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="section-title" style={{ marginTop: 0 }}>Volume Curve (12 mo)</div>
        {curve.length === 0 ? (
          <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--ink-500)', fontSize: 13 }}>
            No volume data yet.
          </div>
        ) : (
          <svg viewBox="0 0 300 70" width="100%" height="70" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke="var(--emerald-500)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={curve
                .map((c, i) => `${(i / (curve.length - 1)) * 300},${70 - ((Number(c.value) || 0) / maxGrowth) * 62}`)
                .join(' ')}
            />
          </svg>
        )}
      </div>

      <div className="section-title">Most Active Users</div>
      <div className="card">
        {(platform.mostActive || []).length === 0 && (
          <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--ink-500)', fontSize: 13 }}>
            No user activity yet.
          </div>
        )}
        {(platform.mostActive || []).map((u, idx) => (
          <div key={u.id ?? idx} className="list-row">
            <div className="list-left">
              <span
                style={{
                  width: 22, height: 22, borderRadius: 6, background: 'var(--emerald-50)', color: 'var(--emerald-600)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800,
                }}
              >
                {idx + 1}
              </span>
              <div>
                <div className="row-title">{u.name}</div>
                <div className="row-sub">{u.transactions} txs</div>
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--emerald-600)' }}>{formatKES(u.volume)} vol</div>
          </div>
        ))}
      </div>
    </>
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
