import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Screen from '../../components/common/Screen';
import Avatar from '../../components/common/Avatar';
import { fetchAnalytics } from '../../features/admin/analyticsSlice';
import { fetchTransactions } from '../../features/admin/auditSlice';
import { fetchWallets } from '../../features/admin/walletsSlice';

export default function PlatformAnalytics() {
  const dispatch = useDispatch();
  const { overview } = useSelector((s) => s.analytics);
  const { entries: transactions } = useSelector((s) => s.audit);
  const { list: wallets } = useSelector((s) => s.wallets);
  const authUser = useSelector((s) => s.auth.user);

  useEffect(() => {
    dispatch(fetchAnalytics());
    dispatch(fetchTransactions());
    dispatch(fetchWallets());
  }, [dispatch]);

  const avgTxSize = transactions.length > 0 ? overview.txVolume / transactions.length : 0;

  const mostActive = useMemo(() => {
    const byWallet = {};
    transactions.forEach((t) => {
      [t.senderWalletId, t.receiverWalletId].forEach((wid) => {
        if (!wid) return;
        if (!byWallet[wid]) byWallet[wid] = { walletId: wid, tx: 0, volume: 0 };
        byWallet[wid].tx += 1;
        byWallet[wid].volume += t.amount;
      });
    });
    return Object.values(byWallet)
      .map((row) => ({
        ...row,
        name: wallets.find((w) => w.walletId === row.walletId)?.userName || `Wallet #${row.walletId}`,
      }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 3);
  }, [transactions, wallets]);

  return (
    <Screen nav="Dashboard">
      <div className="page-eyebrow">Ecosystem Health</div>
      <div className="page-title-row">
        <div className="page-title">Platform Stats</div>
        <Avatar name={authUser?.name || 'Admin'} />
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div className="stat-label">Total Transaction Volume</div>
        <div className="stat-value" style={{ fontSize: 26 }}>${overview.txVolume.toLocaleString()}</div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{overview.totalUsers.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg TX Size</div>
          <div className="stat-value">${avgTxSize.toFixed(2)}</div>
        </div>
      </div>

      <div className="section-title">Most Active Users</div>
      <div className="card">
        {mostActive.length === 0 && (
          <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--ink-500)', fontSize: 13 }}>
            No user activity yet.
          </div>
        )}
        {mostActive.map((u, i) => (
          <div key={u.walletId} className="list-row">
            <div className="list-left">
              <span
                style={{
                  width: 22, height: 22, borderRadius: 6, background: 'var(--orange-50)', color: 'var(--orange-600)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800,
                }}
              >
                {i + 1}
              </span>
              <div>
                <div className="row-title">{u.name}</div>
                <div className="row-sub">{u.tx} txs</div>
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--orange-600)' }}>
              ${u.volume.toLocaleString(undefined, { minimumFractionDigits: 2 })} volume
            </div>
          </div>
        ))}
      </div>
    </Screen>
  );
}
