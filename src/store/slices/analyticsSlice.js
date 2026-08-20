import { createSlice } from '@reduxjs/toolkit';
import { overview, revenue, platform } from '../../mockData';

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    overview,
    revenue,
    platform,
    revenueRange: 'Month',
  },
  reducers: {
    setRevenueRange(state, action) {
      state.revenueRange = action.payload;
    },
  },
});

export const { setRevenueRange } = analyticsSlice.actions;
export default analyticsSlice.reducer;
