import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

function mapUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    status: u.is_active ? 'Active' : 'Frozen',
    balance: Number(u.wallet_balance ?? u.wallet?.balance ?? 0),
    walletId: u.wallet?.id ?? null,
    joined: u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
    role: u.role,
  };
}

export const fetchUsers = createAsyncThunk('users/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/admin/users', { params: { per_page: 100 } });
    return res.data.users.map(mapUser);
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to load users');
  }
});

export const fetchUserById = createAsyncThunk('users/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/admin/users/${id}`);
    return mapUser(res.data);
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to load user');
  }
});

export const setUserActive = createAsyncThunk('users/setActive', async ({ id, is_active }, { rejectWithValue }) => {
  try {
    await api.put(`/admin/users/${id}`, { is_active });
    return { id, status: is_active ? 'Active' : 'Frozen' };
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to update user');
  }
});

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    list: [],
    selected: null,
    filter: 'All',
    query: '',
    status: 'idle',
    error: null,
  },
  reducers: {
    setFilter(state, action) {
      state.filter = action.payload;
    },
    setQuery(state, action) {
      state.query = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.selected = action.payload;
      })
      .addCase(setUserActive.fulfilled, (state, action) => {
        const user = state.list.find((u) => u.id === action.payload.id);
        if (user) user.status = action.payload.status;
        if (state.selected?.id === action.payload.id) state.selected.status = action.payload.status;
      });
  },
});

export const { setFilter, setQuery } = usersSlice.actions;
export default usersSlice.reducer;
