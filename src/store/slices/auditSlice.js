import { createSlice } from '@reduxjs/toolkit';
import { auditLog } from '../../mockData';

const auditSlice = createSlice({
  name: 'audit',
  initialState: {
    entries: auditLog,
    typeFilter: 'All',
    statusFilter: 'Active',
  },
  reducers: {
    setTypeFilter(state, action) {
      state.typeFilter = action.payload;
    },
    setStatusFilter(state, action) {
      state.statusFilter = action.payload;
    },
  },
});

export const { setTypeFilter, setStatusFilter } = auditSlice.actions;
export default auditSlice.reducer;
