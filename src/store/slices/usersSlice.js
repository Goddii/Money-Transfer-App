import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

function extractError(err) {
  return {
    status: err.response?.status,
    message: err.response?.data?.message || err.message || 'Request failed.',
  };
}

export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  const response = await api.get('/v1/admin/users');
  return response.data;
});

export const fetchUserProfile = createAsyncThunk(
  'users/fetchUserProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/v1/admin/users/${userId}/profile`);
      return response.data;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const fetchUserTransactions = createAsyncThunk(
  'users/fetchUserTransactions',
  async ({ userId, page = 1 }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/v1/admin/users/${userId}/transactions`,
        { params: { page, per_page: 20 } }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post('/v1/admin/users', payload);
      return response.data;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, changes }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/v1/admin/users/${id}`, changes);
      return response.data;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const removeUser = createAsyncThunk(
  'users/removeUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/v1/admin/users/${userId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const toggleFreeze = createAsyncThunk(
  'users/toggleFreeze',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/v1/admin/users/${userId}/toggle-freeze`);
      return response.data;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

const initialState = {
  list: [],
  filter: 'All',
  query: '',
  profile: null,
  profileLoading: false,
  profileError: null,
  loading: false,
  error: null,
  createLoading: false,
  createError: null,
  updateLoading: false,
  updateError: null,
  deleteLoading: false,
  deleteError: null,
  deleteSuccess: false,
  transactions: [],
  txLoading: false,
  txError: null,
  txPagination: null,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setFilter(state, action) {
      state.filter = action.payload;
    },
    setQuery(state, action) {
      state.query = action.payload;
    },
    clearCreateError(state) {
      state.createError = null;
    },
    clearUpdateError(state) {
      state.updateError = null;
    },
    clearDeleteError(state) {
      state.deleteError = null;
    },
    resetDeleteSuccess(state) {
      state.deleteSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.users || [];
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || 'Failed to load users.';
      })
      .addCase(fetchUserProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload || { message: 'Failed to load user profile.' };
      })
      .addCase(fetchUserTransactions.pending, (state) => {
        state.txLoading = true;
        state.txError = null;
      })
      .addCase(fetchUserTransactions.fulfilled, (state, action) => {
        state.txLoading = false;
        state.transactions = action.payload.transactions || [];
        state.txPagination = action.payload.pagination || null;
      })
      .addCase(fetchUserTransactions.rejected, (state, action) => {
        state.txLoading = false;
        state.txError = action.payload?.message || 'Failed to load transactions.';
      })
      .addCase(createUser.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createUser.fulfilled, (state) => {
        state.createLoading = false;
        state.createError = null;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload?.message || 'Failed to create user.';
      })
      .addCase(updateUser.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateError = null;
        // Keep an open profile view in sync with the edited user.
        if (
          state.profile &&
          String(state.profile.id) === String(action.meta.arg.id) &&
          action.payload?.user
        ) {
          state.profile = { ...state.profile, ...action.payload.user };
        }
        const user = state.list.find((u) => String(u.id) === String(action.meta.arg.id));
        if (user && action.payload?.user) {
          user.name = action.payload.user.name ?? user.name;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload?.message || 'Failed to update user.';
      })
      .addCase(removeUser.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
        state.deleteSuccess = false;
      })
      .addCase(removeUser.fulfilled, (state) => {
        state.deleteLoading = false;
        state.deleteSuccess = true;
        state.deleteError = null;
      })
      .addCase(removeUser.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteSuccess = false;
        state.deleteError = action.payload?.message || 'Failed to delete user.';
      })
      .addCase(toggleFreeze.fulfilled, (state, action) => {
        const userId = action.meta.arg;
        const user = state.list.find((u) => u.id === userId);
        if (user && action.payload.status) {
          user.status = action.payload.status;
        }
        if (
          state.profile &&
          String(state.profile.id) === String(userId) &&
          action.payload.status
        ) {
          state.profile.status = action.payload.status;
        }
      });
  },
});

export const {
  setFilter,
  setQuery,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  resetDeleteSuccess,
} = usersSlice.actions;
export default usersSlice.reducer;
