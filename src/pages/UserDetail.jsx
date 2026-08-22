import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Lock, Unlock, Pencil } from 'lucide-react';
import Screen from '../components/Screen';
import { toggleFreeze, fetchUserProfile } from '../store/slices/usersSlice';
import { userTransactions } from '../mockData';
import { parseMoney } from '../utils/format';
import { useEffect } from 'react';

const centerStyle = {
  padding: '40px 0',
  textAlign: 'center',
  color: 'var(--ink-500)',
  fontSize: 14,
};

export default function UserDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile, profileLoading, profileError } = useSelector((s) => s.users);
  const txs = userTransactions[id] || [];

  useEffect(() => {
    dispatch(fetchUserProfile(id));
  }, [dispatch, id]);

  if (profileLoading) {
    return (
      <Screen nav="Users">
        <div style={centerStyle}>Loading user…</div>
      </Screen>
    );
  }

  if (profileError) {
    // A 404 from the backend means the requested user does not exist.
    if (profileError.status === 404) {
      return (
        <Screen nav="Users">
          <div style={centerStyle}>User not found.</div>
        </Screen>
      );
    }
    return (
      <Screen nav="Users">
        <div style={centerStyle}>
          <div className="page-title" style={{ marginBottom: 8 }}>Unable to load profile</div>
          <div style={{ fontSize: 13 }}>{profileError.message}</div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => dispatch(fetchUserProfile(id))}>Retry</button>
        </div>
      </Screen>
    );
  }

  const user = profile;
  if (!user) {
    return (
      <Screen nav="Users">
        <div style={centerStyle}>User not found.</div>
      </Screen>
    );
  }

  const frozen = user.status === 'Frozen';
  // Backend /profile returns wallet_balance as a number string and
  // total_sent/total_received as pre-formatted money strings.
  const balance = Number(user.wallet_balance) || 0;
  const totalSent = parseMoney(user.total_sent);
  const totalReceived = parseMoney(user.total_received);
  const joined = user.joined ?? '—';
  const avatar = user.avatar ?? '';
  const phone = user.phone ?? '—';

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
          <img className="avatar" style={{ width: 48, height: 48 }} src={avatar} alt={user.name} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{user.name}</div>
            <div className="row-sub">Joined {joined}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <div className="stat-label">Email</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{user.email}</div>
          </div>
          <div>
            <div className="stat-label">Phone</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{phone}</div>
          </div>
        </div>
      </div>

      <div className="balance-card">
        <div className="balance-label">Wallet Current Balance</div>
        <div className="balance-value">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        <div className="balance-split">
          <div>
            <div className="label">Total Sent</div>
            <div className="val">${totalSent.toLocaleString()}</div>
          </div>
          <div>
            <div className="label">Total Received</div>
            <div className="val">${totalReceived.toLocaleString()}</div>
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
