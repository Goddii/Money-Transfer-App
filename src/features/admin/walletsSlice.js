import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export const fetchWallets = createAsyncThunk('wallets/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/admin/wallets');
    return res.data.wallets.map((w) => ({
      walletId: w.wallet_id,
      userId: w.user_id,
      userName: w.user_name,
      balance: Number(w.balance),
      currency: w.currency,
    }));
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to load wallets');
  }
});

const walletsSlice = createSlice({
  name: 'wallets',
  initialState: { list: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWallets.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchWallets.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchWallets.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default walletsSlice.reducer;
