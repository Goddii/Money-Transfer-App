import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export const fetchAnalytics = createAsyncThunk('analytics/fetchOverview', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/admin/analytics');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to load analytics');
  }
});

export const fetchProfitTrends = createAsyncThunk('analytics/fetchProfitTrends', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/admin/analytics/profit-trends');
    return res.data.profit_trends;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to load profit trends');
  }
});

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    overview: {
      totalUsers: 0,
      platformLiquidity: 0,
      txVolume: 0,
      collectedFees: 0,
    },
    trends: [],
    revenueRange: 'Month',
    status: 'idle',
    error: null,
  },
  reducers: {
    setRevenueRange(state, action) {
      state.revenueRange = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.overview = {
          totalUsers: action.payload.total_users,
          platformLiquidity: Number(action.payload.total_liquidity),
          txVolume: Number(action.payload.total_transaction_volume),
          collectedFees: Number(action.payload.total_platform_profit),
        };
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchProfitTrends.fulfilled, (state, action) => {
        state.trends = action.payload.map((t) => ({
          date: t.date,
          profit: Number(t.daily_profit),
          volume: Number(t.daily_volume),
          count: t.transaction_count,
        }));
      });
  },
});

export const { setRevenueRange } = analyticsSlice.actions;
export default analyticsSlice.reducer;
