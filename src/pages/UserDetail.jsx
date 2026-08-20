import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Lock, Unlock, Pencil } from 'lucide-react';
import Screen from '../components/Screen';
import { toggleFreeze } from '../store/slices/usersSlice';
import { userTransactions } from '../mockData';

export default function UserDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.users.list.find((u) => String(u.id) === id));
  const txs = userTransactions[id] || [];

  if (!user) {
    return (
      <Screen nav="Users">
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--ink-500)' }}>User not found.</div>
      </Screen>
    );
  }

  const frozen = user.status === 'Frozen';

  return (
    <Screen nav="Users">
      <div className="page-title-row">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={17} />
        </button>
        <span style={{ fontSize: 15, fontWeight: 700 }}>User Profile</span>
        <span className="pill pill-green">Verified Customer</span>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
          <img className="avatar" style={{ width: 48, height: 48 }} src={user.avatar} alt={user.name} />
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
            <div className="stat-label">Phone</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{user.phone}</div>
          </div>
        </div>
      </div>

      <div className="balance-card">
        <div className="balance-label">Wallet Current Balance</div>
        <div className="balance-value">${user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        <div className="balance-split">
          <div>
            <div className="label">Total Sent</div>
            <div className="val">${user.totalSent.toLocaleString()}</div>
          </div>
          <div>
            <div className="label">Total Received</div>
            <div className="val">${user.totalReceived.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="section-title">Administrative Actions</div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
        <button
          className={`btn btn-block ${frozen ? 'btn-primary' : 'btn-danger-soft'}`}
          onClick={() => dispatch(toggleFreeze(user.id))}
        >
          {frozen ? <Unlock size={15} /> : <Lock size={15} />}
          {frozen ? 'Unfreeze Account' : 'Freeze Account'}
        </button>
        <button className="btn btn-outline btn-block">
          <Pencil size={15} />
          Edit Profile
        </button>
      </div>

      <div className="section-title">Recent Transactions</div>
      <div className="card">
        {txs.length === 0 && (
          <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--ink-500)', fontSize: 13 }}>
            No recent transactions.
          </div>
        )}
        {txs.map((t, i) => (
          <div key={i} className="list-row">
            <div>
              <div className="row-title">{t.name}</div>
              <div className="row-sub">{t.type}</div>
            </div>
            <div className={`row-amount ${t.amount > 0 ? 'pos' : 'neg'}`}>
              {t.amount > 0 ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </Screen>
  );
}
