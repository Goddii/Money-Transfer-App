import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

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
      return rejectWithValue({
        status: err.response?.status,
        message: err.response?.data?.message || err.message,
      });
    }
  }
);

export const toggleFreeze = createAsyncThunk('users/toggleFreeze', async (userId) => {
  const response = await api.patch(`/v1/admin/users/${userId}/toggle-freeze`);
  return response.data;
});

export const updateUser = createAsyncThunk('users/updateUser', async ({ id, changes }) => {
  // NOTE: no backend route for this yet (PATCH /v1/admin/users/:id).
  // Left pointing at the sensible future path so this just needs the
  // route added later rather than a frontend change too.
  const response = await api.patch(`/v1/admin/users/${id}`, changes);
  return response.data;
});

export const removeUser = createAsyncThunk('users/removeUser', async (userId) => {
  // NOTE: no backend DELETE route for this yet.
  await api.delete(`/v1/admin/users/${userId}`);
  return userId;
});

const initialState = {
  list: [],
  filter: 'All',
  query: '',
  profile: null,
  profileLoading: false,
  profileError: null,
  loading: false,
  error: null,
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
      .addCase(toggleFreeze.fulfilled, (state, action) => {
        const userId = action.meta.arg;
        const user = state.list.find((u) => u.id === userId);
        if (user && action.payload.status) {
          user.status = action.payload.status;
        }
        // Keep an open profile view in sync with the freeze toggle.
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

export const { setFilter, setQuery } = usersSlice.actions;
export default usersSlice.reducer;