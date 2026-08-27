import { useMemo, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Search, Plus, ChevronRight, X } from 'lucide-react';
import Screen from '../components/Screen';
import StatusPill from '../components/StatusPill';
import { setFilter, setQuery, fetchUsers, createUser, clearCreateError } from '../store/slices/usersSlice';

const centerStyle = {
  padding: '40px 0',
  textAlign: 'center',
  color: 'var(--ink-500)',
  fontSize: 14,
};

const emptyForm = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  phone_number: '',
  initial_balance: '0',
};

export default function UserManagement() {
  const dispatch = useDispatch();
  const { list, filter, query, loading, error } = useSelector((s) => s.users);
  const { createLoading, createError } = useSelector((s) => s.users);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [success, setSuccess] = useState('');

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const filtered = useMemo(
    () =>
      list.filter((u) => {
        const matchesFilter = filter === 'All' || u.status === filter;
        const matchesQuery =
          !query ||
          u.name.toLowerCase().includes(query.toLowerCase()) ||
          u.email.toLowerCase().includes(query.toLowerCase());
        return matchesFilter && matchesQuery;
      }),
    [list, filter, query]
  );

  function openModal() {
    setForm(emptyForm);
    setFormErrors({});
    dispatch(clearCreateError());
    setSuccess('');
    setModalOpen(true);
  }

  function validate() {
    const errs = {};
    if (!form.first_name.trim()) errs.first_name = 'First name is required.';
    if (!form.last_name.trim()) errs.last_name = 'Last name is required.';
    if (!form.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      errs.email = 'A valid email is required.';
    }
    if (!form.password || String(form.password).length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
    const bal = Number(form.initial_balance);
    if (form.initial_balance !== '' && (!Number.isFinite(bal) || bal < 0)) {
      errs.initial_balance = 'Initial balance must be zero or more.';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      password: form.password,
      phone_number: form.phone_number.trim() || null,
      initial_balance: Number(form.initial_balance) || 0,
    };
    const result = await dispatch(createUser(payload));
    if (createUser.fulfilled.match(result)) {
      setSuccess('User created successfully.');
      setModalOpen(false);
      dispatch(fetchUsers());
    }
  }

  if (error) {
    return (
      <Screen nav="Users">
        <div style={centerStyle}>
          <div className="page-title" style={{ marginBottom: 8 }}>Unable to load users</div>
          <div style={{ fontSize: 13 }}>{error}</div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => dispatch(fetchUsers())}>Retry</button>
        </div>
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen nav="Users">
        <div style={centerStyle}>Loading users…</div>
      </Screen>
    );
  }

  return (
    <Screen nav="Users">
      <div className="page-eyebrow">User Management</div>
      <div className="page-title-row">
        <div className="page-title">Users</div>
        <div className="avatar" style={{ background: 'var(--emerald-50)', color: 'var(--emerald-600)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          A
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <div className="search-bar">
          <Search size={16} color="var(--ink-500)" />
          <input
            placeholder="Search email or name..."
            value={query}
            onChange={(e) => dispatch(setQuery(e.target.value))}
          />
        </div>
        <button className="fab" title="Add user" onClick={openModal}>
          <Plus size={20} />
        </button>
      </div>

      {success && (
        <div className="alert alert-success" style={{ marginBottom: 14 }}>{success}</div>
      )}

      <div className="segment">
        {['All', 'Active', 'Frozen'].map((f) => (
          <button key={f} className={filter === f ? 'active' : ''} onClick={() => dispatch(setFilter(f))}>
            {f === 'All' ? `All (${list.length})` : f}
          </button>
        ))}
      </div>

      <div className="card">
        {filtered.length === 0 && (
          <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--ink-500)', fontSize: 13 }}>
            {list.length === 0 ? 'No users yet.' : 'No users match this search.'}
          </div>
        )}
        {filtered.map((u) => (
          <Link key={u.id} to={`/admin/users/${u.id}`} className="list-row">
            <div className="list-left">
              <div className="avatar" style={{ width: 34, height: 34, background: 'var(--emerald-50)', color: 'var(--emerald-600)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {u.name?.[0] || '?'}
              </div>
              <div>
                <div className="row-title">{u.name}</div>
                <div className="row-sub">{u.email}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <StatusPill status={u.status} />
              <ChevronRight size={16} color="var(--ink-300)" />
            </div>
          </Link>
        ))}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => !createLoading && setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="page-title" style={{ fontSize: 18 }}>Add User</div>
              <button className="icon-btn" onClick={() => !createLoading && setModalOpen(false)} disabled={createLoading}>
                <X size={18} />
              </button>
            </div>

            {createError && (
              <div className="alert alert-error" style={{ marginBottom: 12 }}>{createError}</div>
            )}

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-row">
                <label>First Name</label>
                <input
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  placeholder="Jane"
                />
                {formErrors.first_name && <span className="field-error">{formErrors.first_name}</span>}
              </div>

              <div className="form-row">
                <label>Last Name</label>
                <input
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  placeholder="Wanjiru"
                />
                {formErrors.last_name && <span className="field-error">{formErrors.last_name}</span>}
              </div>

              <div className="form-row">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="jane@example.com"
                />
                {formErrors.email && <span className="field-error">{formErrors.email}</span>}
              </div>

              <div className="form-row">
                <label>Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="At least 6 characters"
                />
                {formErrors.password && <span className="field-error">{formErrors.password}</span>}
              </div>

              <div className="form-row">
                <label>Phone (optional)</label>
                <input
                  value={form.phone_number}
                  onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                  placeholder="+254 7xx xxx xxx"
                />
              </div>

              <div className="form-row">
                <label>Initial Balance (KES, optional)</label>
                <input
                  type="number"
                  min="0"
                  value={form.initial_balance}
                  onChange={(e) => setForm({ ...form, initial_balance: e.target.value })}
                  placeholder="0"
                />
                {formErrors.initial_balance && <span className="field-error">{formErrors.initial_balance}</span>}
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" className="btn btn-outline btn-block" onClick={() => setModalOpen(false)} disabled={createLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-block" disabled={createLoading}>
                  {createLoading ? 'Creating…' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Screen>
  );
}
