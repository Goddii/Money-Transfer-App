import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export const fetchTransactions = createAsyncThunk('audit/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/admin/transactions');
    return res.data.transactions.map((t) => ({
      id: `TX-${t.id}`,
      status: t.status,
      senderWalletId: t.sender_wallet_id,
      receiverWalletId: t.receiver_wallet_id,
      amount: Number(t.amount),
      fee: Number(t.fee_charged),
      type: t.type,
      time: new Date(t.timestamp).toLocaleString(),
    }));
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to load transactions');
  }
});

const auditSlice = createSlice({
  name: 'audit',
  initialState: {
    entries: [],
    typeFilter: 'All',
    statusFilter: 'All',
    status: 'idle',
    error: null,
  },
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
      .addCase(fetchTransactions.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.entries = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { setTypeFilter, setStatusFilter } = auditSlice.actions;
export default auditSlice.reducer;
