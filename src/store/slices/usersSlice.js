import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  const response = await api.get('/api/users');
  return response.data;
});

export const toggleFreeze = createAsyncThunk('users/toggleFreeze', async (userId) => {
  const response = await api.patch(`/api/users/${userId}/freeze`);
  return response.data;
});

export const updateUser = createAsyncThunk('users/updateUser', async ({ id, changes }) => {
  const response = await api.patch(`/api/users/${id}`, changes);
  return response.data;
});

export const removeUser = createAsyncThunk('users/removeUser', async (userId) => {
  await api.delete(`/api/users/${userId}`);
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
      });
  },
});

export const { setFilter, setQuery } = usersSlice.actions;
export default usersSlice.reducer;
