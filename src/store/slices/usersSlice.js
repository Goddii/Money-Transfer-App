import { createSlice } from '@reduxjs/toolkit';
import { users as seedUsers } from '../../mockData';

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    list: seedUsers,
    filter: 'All',
    query: '',
  },
  reducers: {
    setFilter(state, action) {
      state.filter = action.payload;
    },
    setQuery(state, action) {
      state.query = action.payload;
    },
    toggleFreeze(state, action) {
      const user = state.list.find((u) => u.id === action.payload);
      if (user) user.status = user.status === 'Frozen' ? 'Active' : 'Frozen';
    },
    updateUser(state, action) {
      const { id, changes } = action.payload;
      const user = state.list.find((u) => u.id === id);
      if (user) Object.assign(user, changes);
    },
    removeUser(state, action) {
      state.list = state.list.filter((u) => u.id !== action.payload);
    },
  },
});

export const { setFilter, setQuery, toggleFreeze, updateUser, removeUser } = usersSlice.actions;
export default usersSlice.reducer;
