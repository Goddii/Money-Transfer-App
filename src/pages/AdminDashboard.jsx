import { useSelector } from 'react-redux';
import { Users as UsersIcon, ScrollText, BarChart3, ChevronRight, Receipt } from 'lucide-react';
import { Link } from 'react-router-dom';
import Screen from '../components/Screen';
import StatCard from '../components/StatCard';
import { admin } from '../mockData';

export default function AdminDashboard() {
  const { overview } = useSelector((s) => s.analytics);
  const maxVol = Math.max(...overview.txVolume30d, 1);

  return (
    <Screen nav="Dashboard">
      <div className="page-eyebrow">Admin Portal</div>
      <div className="page-title-row">
        <div className="page-title">Overview</div>
        <img className="avatar" src={admin.avatar} alt={admin.name} />
      </div>

      <div className="stat-grid">
        <StatCard label="Total Users" value={overview.totalUsers.toLocaleString()} delta={overview.totalUsersDelta} />
        <StatCard label="Active Wallets" value={overview.activeWallets.toLocaleString()} delta={overview.activeWalletsNote} deltaTone="flat" />
        <StatCard label="Platform TXs" value={overview.transactionsTotal} delta={overview.transactionsNote} deltaTone="flat" />
        <StatCard label="Platform Liquidity" value={`$${overview.platformLiquidity}M`} delta={overview.platformLiquidityNote} deltaTone="flat" />
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)' }}>Transaction Volume (30d)</span>
          <span style={{ fontSize: 11.5, color: 'var(--ink-500)', fontWeight: 600 }}>Avg {overview.avgTxVolume}</span>
        </div>
        <svg viewBox="0 0 300 60" width="100%" height="60" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="var(--orange-500)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={overview.txVolume30d
              .map((v, i) => `${(i / (overview.txVolume30d.length - 1)) * 300},${60 - (v / maxVol) * 54}`)
              .join(' ')}
          />
        </svg>
      </div>

      <button className="fee-banner" style={{ width: '100%', border: 'none' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Receipt size={18} color="var(--orange-600)" />
          <span style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--orange-600)' }}>Collected Fees This Month</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink-900)' }}>
              ${overview.collectedFees.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </span>
        </span>
        <ChevronRight size={18} color="var(--ink-500)" />
      </button>

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
