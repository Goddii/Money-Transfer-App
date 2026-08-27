import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

function parseMoney(value) {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  const parsed = Number(value.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

export const fetchAuditLog = createAsyncThunk('audit/fetchAuditLog', async () => {
  const response = await api.get('/v1/admin/audit-log');
  return response.data;
});

const initialState = {
  entries: [],
  typeFilter: 'All',
  statusFilter: 'All',
  loading: false,
  error: null,
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
      .addCase(fetchAuditLog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuditLog.fulfilled, (state, action) => {
        state.loading = false;
        const records = action.payload?.audit_log || [];
        state.entries = records.map((r) => ({
          id: r.tx_code,
          status: r.status,
          sender: r.sender_name,
          receiver: r.receiver_name,
          amount: parseMoney(r.amount),
          fee: parseMoney(r.fee),
          time: r.timestamp,
        }));
      })
      .addCase(fetchAuditLog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || 'Failed to load audit log.';
      });
  },
});

export const { setTypeFilter, setStatusFilter } = auditSlice.actions;
export default auditSlice.reducer;