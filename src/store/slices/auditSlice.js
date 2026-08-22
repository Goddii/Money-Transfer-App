import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchAuditLog = createAsyncThunk('audit/fetchAuditLog', async () => {
  const response = await api.get('/api/audit-log');
  return response.data;
});

const initialState = {
  entries: [],
  typeFilter: 'All',
  statusFilter: 'Active',
};

const auditSlice = createSlice({
  name: 'audit',
  initialState,
  reducers: {
    setTypeFilter(state, action) {
      state.typeFilter = action.payload;
    },
    setStatusFilter(state, action) {
      state.statusFilter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditLog.fulfilled, (state, action) => {
        state.entries = action.payload.entries || [];
      });
  },
});

export const { setTypeFilter, setStatusFilter } = auditSlice.actions;
export default auditSlice.reducer;