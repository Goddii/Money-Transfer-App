import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Backend sends money fields as pre-formatted strings like "$1,234.00".
// This strips the formatting back down to a plain number for the UI to
// re-format however each page needs.
function parseMoney(value) {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  const parsed = Number(value.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

export const fetchOverview = createAsyncThunk('analytics/fetchOverview', async () => {
  const response = await api.get('/v1/admin/overview');
  return response.data;
});

export const fetchRevenue = createAsyncThunk('analytics/fetchRevenue', async () => {
  const response = await api.get('/v1/admin/revenue-analytics');
  return response.data;
});

export const fetchPlatform = createAsyncThunk('analytics/fetchPlatform', async () => {
  const response = await api.get('/v1/admin/platform');
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
    avgTxVolume: 'KES 0.00',
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
  overviewLoading: false,
  overviewError: null,
  overviewLoaded: false,
  revenueLoading: false,
  revenueError: null,
  revenueLoaded: false,
  platformLoading: false,
  platformError: null,
  platformLoaded: false,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOverview.pending, (state) => {
        state.overviewLoading = true;
        state.overviewError = null;
      })
      .addCase(fetchOverview.fulfilled, (state, action) => {
        state.overviewLoading = false;
        state.overviewLoaded = true;
        const data = action.payload || {};
        // Backend (GET /v1/admin/overview) returns these four fields flat.
        // platform_liquidity/collected_fees come back as "KES 1234.00"; the UI
        // re-formats them as KES, so keep the raw numeric value here.
        state.overview = {
          ...initialState.overview,
          totalUsers: Number(data.total_users) || 0,
          activeWallets: Number(data.active_wallets) || 0,
          platformLiquidity: parseMoney(data.platform_liquidity),
          collectedFees: parseMoney(data.collected_fees),
        };
      })
      .addCase(fetchOverview.rejected, (state, action) => {
        state.overviewLoading = false;
        state.overviewError = action.error?.message || 'Failed to load dashboard data.';
      })
      .addCase(fetchRevenue.pending, (state) => {
        state.revenueLoading = true;
        state.revenueError = null;
      })
      .addCase(fetchRevenue.fulfilled, (state, action) => {
        state.revenueLoading = false;
        state.revenueLoaded = true;
        const data = action.payload || {};
        const trend = (data.revenue_trend_months || []).map((m) => ({
          month: m.month,
          value: Number(m.revenue) || 0,
        }));
        const sourceAmounts = (data.revenue_by_source || []).map((s) => ({
          label: s.source,
          amount: parseMoney(s.amount),
        }));
        const sourceTotal = sourceAmounts.reduce((sum, s) => sum + s.amount, 0);
        const bySource = sourceAmounts.map((s) => ({
          ...s,
          pct: sourceTotal > 0 ? Math.round((s.amount / sourceTotal) * 100) : 0,
        }));

        state.revenue = {
          ...initialState.revenue,
          // Backend doesn't return a single "this month" figure yet, so we
          // sum the trend as a stand-in total until that's added.
          monthRevenue: trend.reduce((sum, t) => sum + t.value, 0),
          trend,
          bySource,
        };
      })
      .addCase(fetchRevenue.rejected, (state, action) => {
        state.revenueLoading = false;
        state.revenueError = action.error?.message || 'Failed to load revenue data.';
      })
      .addCase(fetchPlatform.pending, (state) => {
        state.platformLoading = true;
        state.platformError = null;
      })
      .addCase(fetchPlatform.fulfilled, (state, action) => {
        state.platformLoading = false;
        state.platformLoaded = true;
        // Backend (GET /v1/admin/platform) returns the analytics flat, not
        // nested under a "platform" key. Spread the real payload directly.
        state.platform = { ...initialState.platform, ...(action.payload || {}) };
      })
      .addCase(fetchPlatform.rejected, (state, action) => {
        state.platformLoading = false;
        state.platformError = action.error?.message || 'Failed to load platform data.';
      });
  },
});

export default analyticsSlice.reducer;