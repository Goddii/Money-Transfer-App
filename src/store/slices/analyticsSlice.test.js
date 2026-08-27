import { describe, it, expect } from 'vitest';
import analyticsReducer, {
  fetchOverview,
  fetchRevenue,
  fetchPlatform,
} from './analyticsSlice';

function initial() {
  return analyticsReducer(undefined, { type: '@@INIT' });
}

describe('analyticsSlice backend contract mapping', () => {
  it('fetchPlatform maps the FLAT backend payload (no .platform nesting)', () => {
    const payload = {
      volumeMonthly: 12345.5,
      volumeDelta: 12.3,
      newUsersMo: 7,
      newUsersNote: '7 new users this month',
      avgTxSize: 500,
      avgTxSizeNote: 'Average transfer size',
      growthCurve: [{ month: '2026-01', label: 'Jan', value: 100 }],
      mostActive: [{ id: 1, name: 'Bob', volume: 900, transactions: 3 }],
      totalUsers: 20,
    };
    const state = analyticsReducer(initial(), fetchPlatform.fulfilled(payload, 'req'));
    expect(state.platformLoaded).toBe(true);
    expect(state.platform.volumeMonthly).toBe(12345.5);
    expect(state.platform.growthCurve[0].value).toBe(100);
    expect(state.platform.mostActive[0].transactions).toBe(3);
  });

  it('fetchRevenue maps trend and bySource correctly', () => {
    const payload = {
      revenue_trend_months: [{ month: 'May', revenue: 10 }],
      revenue_by_source: [{ source: 'transfer', amount: 'KES 10.00' }],
    };
    const state = analyticsReducer(initial(), fetchRevenue.fulfilled(payload, 'req'));
    expect(state.revenue.trend).toEqual([{ month: 'May', value: 10 }]);
    expect(state.revenue.bySource[0].amount).toBe(10);
    expect(state.revenue.monthRevenue).toBe(10);
  });

  it('fetchOverview keeps raw liquidity (not divided by 1e6) and parses KES strings', () => {
    const payload = {
      total_users: '5',
      active_wallets: '2',
      platform_liquidity: 'KES 1000.00',
      collected_fees: 'KES 50.00',
    };
    const state = analyticsReducer(initial(), fetchOverview.fulfilled(payload, 'req'));
    expect(state.overview.totalUsers).toBe(5);
    expect(state.overview.platformLiquidity).toBe(1000);
    expect(state.overview.collectedFees).toBe(50);
  });
});
