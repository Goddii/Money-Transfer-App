import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  const response = await api.get('/v1/admin/users');
  return response.data;
});

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
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.list = action.payload.users || [];
      })
      .addCase(toggleFreeze.fulfilled, (state, action) => {
        const userId = action.meta.arg;
        const user = state.list.find((u) => u.id === userId);
        if (user && action.payload.status) {
          user.status = action.payload.status;
        }
      });
  },
});

export const { setFilter, setQuery } = usersSlice.actions;
export default usersSlice.reducer;