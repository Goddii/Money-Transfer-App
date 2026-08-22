import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Search, Plus, ChevronRight } from 'lucide-react';
import Screen from '../../components/common/Screen';
import StatusPill from '../../components/common/StatusPill';
import Avatar from '../../components/common/Avatar';
import { fetchUsers, setFilter, setQuery } from '../../features/admin/usersSlice';

export default function UserManagement() {
  const dispatch = useDispatch();
  const { list, filter, query, status, error } = useSelector((s) => s.users);
  const authUser = useSelector((s) => s.auth.user);

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

  return (
    <Screen nav="Users">
      <div className="page-eyebrow">User Management</div>
      <div className="page-title-row">
        <div className="page-title">Users</div>
        <Avatar name={authUser?.name || 'Admin'} />
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
        {status === 'loading' && (
          <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--ink-500)', fontSize: 13 }}>Loading users...</div>
        )}
        {status === 'failed' && (
          <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--red-600)', fontSize: 13 }}>{error}</div>
        )}
        {status === 'succeeded' && filtered.length === 0 && (
          <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--ink-500)', fontSize: 13 }}>
            {list.length === 0 ? 'No users yet.' : 'No users match this search.'}
          </div>
        )}
        {filtered.map((u) => (
          <Link key={u.id} to={`/users/${u.id}`} className="list-row">
            <div className="list-left">
              <Avatar name={u.name} size={34} />
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
