import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Lock, Unlock } from 'lucide-react';
import Screen from '../../components/common/Screen';
import Avatar from '../../components/common/Avatar';
import { fetchUserById, setUserActive } from '../../features/admin/usersSlice';
import { fetchTransactions } from '../../features/admin/auditSlice';

export default function UserDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.users.selected);
  const usersStatus = useSelector((s) => s.users.status);
  const { entries: transactions } = useSelector((s) => s.audit);

  useEffect(() => {
    dispatch(fetchUserById(id));
    dispatch(fetchTransactions());
  }, [dispatch, id]);

  if (!user || String(user.id) !== id) {
    return (
      <Screen nav="Users">
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--ink-500)' }}>
          {usersStatus === 'failed' ? 'Could not load this user.' : 'Loading...'}
        </div>
      </Screen>
    );
  }

  const frozen = user.status === 'Frozen';
  const userTxs = transactions.filter((t) => t.senderWalletId === user.walletId || t.receiverWalletId === user.walletId);

  return (
    <Screen nav="Users">
      <div className="page-title-row">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={17} />
        </button>
        <span style={{ fontSize: 15, fontWeight: 700 }}>User Profile</span>
        <span className={`pill ${user.status === 'Active' ? 'pill-green' : 'pill-red'}`}>{user.status}</span>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
          <Avatar name={user.name} size={48} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{user.name}</div>
            <div className="row-sub">Joined {user.joined}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <div className="stat-label">Email</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{user.email}</div>
          </div>
          <div>
            <div className="stat-label">Role</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{user.role}</div>
          </div>
        </div>
      </div>

      <div className="balance-card">
        <div className="balance-label">Wallet Current Balance</div>
        <div className="balance-value">${user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
      </div>

      <div className="section-title">Administrative Actions</div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
        <button
          className={`btn btn-block ${frozen ? 'btn-primary' : 'btn-danger-soft'}`}
          onClick={() => dispatch(setUserActive({ id: user.id, is_active: frozen }))}
        >
          {frozen ? <Unlock size={15} /> : <Lock size={15} />}
          {frozen ? 'Unfreeze Account' : 'Freeze Account'}
        </button>
      </div>

      <div className="section-title">Recent Transactions</div>
      <div className="card">
        {userTxs.length === 0 && (
          <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--ink-500)', fontSize: 13 }}>
            No recent transactions.
          </div>
        )}
        {userTxs.map((t) => (
          <div key={t.id} className="list-row">
            <div>
              <div className="row-title">{t.id}</div>
              <div className="row-sub">{t.type}</div>
            </div>
            <div className={`row-amount ${t.receiverWalletId === user.walletId ? 'pos' : 'neg'}`}>
              {t.receiverWalletId === user.walletId ? '+' : '-'}${t.amount.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </Screen>
  );
}
