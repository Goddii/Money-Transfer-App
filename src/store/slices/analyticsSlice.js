import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchOverview = createAsyncThunk('analytics/fetchOverview', async () => {
  const response = await api.get('/api/overview');
  return response.data;
});

export const fetchRevenue = createAsyncThunk('analytics/fetchRevenue', async () => {
  const response = await api.get('/api/revenue');
  return response.data;
});

export const fetchPlatform = createAsyncThunk('analytics/fetchPlatform', async () => {
  const response = await api.get('/api/platform');
  return response.data;
});

const initialState = {
  overview: {
    totalUsers: 0,
    totalUsersDelta: '',
    activeWallets: 0,
    activeWalletsNote: '',
    transactionsTotal: '0',
    transactionsNote: '',
    platformLiquidity: 0,
    platformLiquidityNote: '',
    txVolume30d: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    avgTxVolume: '$0.00',
    collectedFees: 0,
    avatar: '',
    name: '',
  },
  revenue: {
    monthRevenue: 0,
    monthRevenueDelta: '',
    avgFee: 0,
    avgFeeNote: '',
    trend: [],
    bySource: [],
  },
  platform: {
    volumeMonthly: 0,
    volumeDelta: '',
    newUsersMo: 0,
    newUsersNote: '',
    avgTxSize: 0,
    avgTxSizeNote: '',
    growthCurve: [],
    mostActive: [],
  },
  revenueRange: 'Month',
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setRevenueRange(state, action) {
      state.revenueRange = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOverview.fulfilled, (state, action) => {
        state.overview = action.payload.overview || {};
      })
      .addCase(fetchRevenue.fulfilled, (state, action) => {
        state.revenue = { ...initialState.revenue, ...action.payload.revenue };
      })
      .addCase(fetchPlatform.fulfilled, (state, action) => {
        state.platform = { ...initialState.platform, ...action.payload.platform };
      });
  },
});

export const { setRevenueRange } = analyticsSlice.actions;
export default analyticsSlice.reducer;