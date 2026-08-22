import { useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Search, Plus, ChevronRight } from 'lucide-react';
import Screen from '../components/Screen';
import StatusPill from '../components/StatusPill';
import { setFilter, setQuery, fetchUsers } from '../store/slices/usersSlice';
import { admin } from '../mockData';

const centerStyle = {
  padding: '40px 0',
  textAlign: 'center',
  color: 'var(--ink-500)',
  fontSize: 14,
};

export default function UserManagement() {
  const dispatch = useDispatch();
  const { list, filter, query, loading, error } = useSelector((s) => s.users);

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
        <img className="avatar" src={admin.avatar} alt={admin.name} />
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
        <button className="fab" title="Add user">
          <Plus size={20} />
        </button>
      </div>

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
              <img className="avatar" style={{ width: 34, height: 34 }} src={u.avatar} alt={u.name} />
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
    </Screen>
  );
}