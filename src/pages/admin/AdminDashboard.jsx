import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users as UsersIcon, ScrollText, BarChart3, ChevronRight, Receipt } from 'lucide-react';
import { Link } from 'react-router-dom';
import Screen from '../../components/common/Screen';
import StatCard from '../../components/common/StatCard';
import Avatar from '../../components/common/Avatar';
import { fetchAnalytics, fetchProfitTrends } from '../../features/admin/analyticsSlice';

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { overview, trends, status, error } = useSelector((s) => s.analytics);
  const authUser = useSelector((s) => s.auth.user);

  useEffect(() => {
    dispatch(fetchAnalytics());
    dispatch(fetchProfitTrends());
  }, [dispatch]);

  const volumeSeries = [...trends].reverse().map((t) => t.volume);
  const maxVol = Math.max(...volumeSeries, 1);

  return (
    <Screen nav="Dashboard">
      <div className="page-eyebrow">Admin Portal</div>
      <div className="page-title-row">
        <div className="page-title">Overview</div>
        <Avatar name={authUser?.name || 'Admin'} />
      </div>

      {status === 'failed' && (
        <div className="card" style={{ marginBottom: 12, color: 'var(--red-600)', fontSize: 13 }}>
          {error}
        </div>
      )}

      <div className="stat-grid">
        <StatCard label="Total Users" value={overview.totalUsers.toLocaleString()} />
        <StatCard label="Platform Liquidity" value={`$${overview.platformLiquidity.toLocaleString()}`} />
        <StatCard label="Transaction Volume" value={`$${overview.txVolume.toLocaleString()}`} />
        <StatCard label="Collected Fees" value={`$${overview.collectedFees.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)' }}>Daily Volume Trend</span>
        </div>
        {volumeSeries.length === 0 ? (
          <div style={{ padding: '10px 0', textAlign: 'center', color: 'var(--ink-500)', fontSize: 13 }}>
            No transaction history yet.
          </div>
        ) : (
          <svg viewBox="0 0 300 60" width="100%" height="60" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke="var(--orange-500)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={volumeSeries.map((v, i) => `${(i / Math.max(volumeSeries.length - 1, 1)) * 300},${60 - (v / maxVol) * 54}`).join(' ')}
            />
          </svg>
        )}
      </div>

      <div className="fee-banner">
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Receipt size={18} color="var(--orange-600)" />
          <span style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--orange-600)' }}>Collected Fees (All Time)</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink-900)' }}>
              ${overview.collectedFees.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </span>
        </span>
        <ChevronRight size={18} color="var(--ink-500)" />
      </div>

      <div className="section-title">Quick Links</div>
      <div className="quicklink-grid">
        <Link to="/users" className="quicklink">
          <UsersIcon size={18} />
          Users
        </Link>
        <Link to="/settings" className="quicklink">
          <ScrollText size={18} />
          Audit Logs
        </Link>
        <Link to="/platform" className="quicklink">
          <BarChart3 size={18} />
          Stats
        </Link>
      </div>
    </Screen>
  );
}
