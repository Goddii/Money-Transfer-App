import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, Lock, Unlock, Pencil, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Screen from '../components/Screen';
import StatusPill from '../components/StatusPill';
import {
  toggleFreeze,
  fetchUserProfile,
  fetchUserTransactions,
  updateUser,
  clearUpdateError,
  removeUser,
  clearDeleteError,
  resetDeleteSuccess,
} from '../store/slices/usersSlice';
import { parseMoney, formatKES } from '../utils/format';

const centerStyle = {
  padding: '40px 0',
  textAlign: 'center',
  color: 'var(--ink-500)',
  fontSize: 14,
};

function initials(name) {
  return (name || '?').trim()[0]?.toUpperCase() || '?';
}

function splitName(name = '') {
  const parts = name.trim().split(/\s+/);
  const first_name = parts[0] || '';
  const last_name = parts.slice(1).join(' ') || '';
  return { first_name, last_name };
}

export default function UserDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    profile,
    profileLoading,
    profileError,
    updateLoading,
    updateError,
    deleteLoading,
    deleteError,
    deleteSuccess,
    transactions,
    txLoading,
    txError,
    txPagination,
  } = useSelector((s) => s.users);

  const [txPage, setTxPage] = useState(1);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', phone_number: '', status: 'Active' });
  const [editErrors, setEditErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchUserProfile(id));
  }, [dispatch, id]);

  useEffect(() => {
    dispatch(fetchUserTransactions({ userId: id, page: txPage }));
  }, [dispatch, id, txPage]);

  useEffect(() => {
    if (deleteSuccess) {
      dispatch(resetDeleteSuccess());
      navigate('/admin/users');
    }
  }, [deleteSuccess, dispatch, navigate]);

  // Edit modal pre-population
  function openEdit() {
    const { first_name, last_name } = splitName(profile?.name);
    setEditForm({
      first_name,
      last_name,
      phone_number: (profile?.phone || '').trim(),
      status: profile?.status || 'Active',
    });
    setEditErrors({});
    dispatch(clearUpdateError());
    setEditOpen(true);
  }

  function validateEdit() {
    const errs = {};
    if (!editForm.first_name.trim()) errs.first_name = 'First name is required.';
    if (!editForm.last_name.trim()) errs.last_name = 'Last name is required.';
    if (editForm.status !== 'Active' && editForm.status !== 'Frozen') {
      errs.status = 'Status must be Active or Frozen.';
    }
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleUpdate(e) {
    e.preventDefault();
    if (!validateEdit()) return;
    const changes = {
      first_name: editForm.first_name.trim(),
      last_name: editForm.last_name.trim(),
      phone_number: editForm.phone_number.trim() || null,
      status: editForm.status,
    };
    const result = await dispatch(updateUser({ id: profile.id, changes }));
    if (updateUser.fulfilled.match(result)) {
      setEditOpen(false);
    }
  }

  function handleDelete() {
    dispatch(clearDeleteError());
    dispatch(removeUser(Number(id)));
  }

  function handleFreezeAndClose() {
    dispatch(toggleFreeze(Number(id)));
    setConfirmOpen(false);
  }

  if (profileLoading) {
    return (
      <Screen nav="Users">
        <div style={centerStyle}>Loading user…</div>
      </Screen>
    );
  }

  if (profileError) {
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
  const balance = parseMoney(user.wallet_balance);
  const totalSent = parseMoney(user.total_sent);
  const totalReceived = parseMoney(user.total_received);
  const phone = user.phone || '—';

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
          <div className="avatar" style={{ width: 48, height: 48, background: 'var(--emerald-50)', color: 'var(--emerald-600)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {initials(user.name)}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{user.name}</div>
            <div className="row-sub"><StatusPill status={user.status} /></div>
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
        <div className="balance-value">{formatKES(balance)}</div>
        <div className="balance-split">
          <div>
            <div className="label">Total Sent</div>
            <div className="val">{formatKES(totalSent)}</div>
          </div>
          <div>
            <div className="label">Total Received</div>
            <div className="val">{formatKES(totalReceived)}</div>
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
        <button className="btn btn-outline btn-block" onClick={openEdit}>
          <Pencil size={15} />
          Edit Profile
        </button>
      </div>
      <button
        className="btn btn-danger btn-block"
        style={{ marginBottom: 14 }}
        onClick={() => { dispatch(clearDeleteError()); setConfirmOpen(true); }}
      >
        <Trash2 size={15} />
        Delete User
      </button>

      <div className="section-title">Recent Transactions</div>
      <div className="card">
        {txLoading ? (
          <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--ink-500)', fontSize: 13 }}>
            Loading transactions…
          </div>
        ) : txError ? (
           <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--red-600)', fontSize: 13 }}>{txError}</div>
        ) : transactions.length === 0 ? (
          <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--ink-500)', fontSize: 13 }}>
            No transactions for this user.
          </div>
        ) : (
          <>
            {transactions.map((t) => {
              const out = t.sender?.id === user.id;
              const counterparty = out ? t.receiver : t.sender;
              const name = counterparty?.name || (out ? 'External' : 'System');
              const amount = parseMoney(t.amount);
              const signed = out ? -Math.abs(amount) : Math.abs(amount);
              const when = t.timestamp ? new Date(t.timestamp).toLocaleString() : '';
              return (
                <div key={t.id} className="list-row">
                  <div className="list-left">
                    <div className="avatar" style={{ width: 34, height: 34, background: 'var(--emerald-50)', color: 'var(--emerald-600)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {initials(name)}
                    </div>
                    <div>
                      <div className="row-title">{name}</div>
                      <div className="row-sub">{t.tx_type}{when ? ` • ${when}` : ''}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className={`row-amount ${signed >= 0 ? 'pos' : 'neg'}`}>
                      {signed >= 0 ? '+' : '-'}{formatKES(Math.abs(signed))}
                    </div>
                    <div className="row-sub">{t.status}</div>
                  </div>
                </div>
              );
            })}

            {txPagination && txPagination.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <button
                  className="btn btn-outline"
                  disabled={!txPagination.has_prev}
                  onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={15} /> Prev
                </button>
                <span style={{ fontSize: 12, color: 'var(--ink-500)' }}>
                  Page {txPagination.page} of {txPagination.pages}
                </span>
                <button
                  className="btn btn-outline"
                  disabled={!txPagination.has_next}
                  onClick={() => setTxPage((p) => p + 1)}
                >
                  Next <ChevronRight size={15} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit modal */}
      {editOpen && (
        <div className="modal-overlay" onClick={() => !updateLoading && setEditOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="page-title" style={{ fontSize: 18 }}>Edit User</div>
              <button className="icon-btn" onClick={() => setEditOpen(false)} disabled={updateLoading}>
                <X size={18} />
              </button>
            </div>

            {updateError && (
              <div className="alert alert-error" style={{ marginBottom: 12 }}>{updateError}</div>
            )}

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-row">
                <label>First Name</label>
                <input value={editForm.first_name} onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })} />
                {editErrors.first_name && <span className="field-error">{editErrors.first_name}</span>}
              </div>
              <div className="form-row">
                <label>Last Name</label>
                <input value={editForm.last_name} onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })} />
                {editErrors.last_name && <span className="field-error">{editErrors.last_name}</span>}
              </div>
              <div className="form-row">
                <label>Phone (optional)</label>
                <input value={editForm.phone_number} onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  style={{ border: '1px solid var(--line)', borderRadius: 10, padding: '10px 12px', fontSize: 14 }}
                >
                  <option value="Active">Active</option>
                  <option value="Frozen">Frozen</option>
                </select>
                {editErrors.status && <span className="field-error">{editErrors.status}</span>}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" className="btn btn-outline btn-block" onClick={() => setEditOpen(false)} disabled={updateLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-block" disabled={updateLoading}>
                  {updateLoading ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmOpen && (
        <div className="modal-overlay" onClick={() => !deleteLoading && setConfirmOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="page-title" style={{ fontSize: 18, color: 'var(--red-600)' }}>Delete User</div>
              <button className="icon-btn" onClick={() => setConfirmOpen(false)} disabled={deleteLoading}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: 13.5, color: 'var(--ink-700)', lineHeight: 1.5, margin: '0 0 12px' }}>
              This action is <strong>permanent</strong>. Accounts with financial history
              (transfers or deposits) cannot be deleted to preserve the audit trail. In that
              case, freeze the account instead.
            </p>

            {deleteError && (
              <div className="alert alert-error" style={{ marginBottom: 12 }}>{deleteError}</div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-outline btn-block" onClick={() => setConfirmOpen(false)} disabled={deleteLoading}>
                Cancel
              </button>
              <button className="btn btn-danger btn-block" onClick={handleDelete} disabled={deleteLoading}>
                {deleteLoading ? 'Deleting…' : 'Delete User'}
              </button>
            </div>

            {deleteError && /financial history/i.test(deleteError) && (
              <button className="btn btn-primary btn-block" style={{ marginTop: 10 }} onClick={handleFreezeAndClose} disabled={deleteLoading}>
                <Lock size={15} /> Freeze Account Instead
              </button>
            )}
          </div>
        </div>
      )}
    </Screen>
  );
}
