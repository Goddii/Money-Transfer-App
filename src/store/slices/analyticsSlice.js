import { createSlice } from '@reduxjs/toolkit';
import { overview, revenue, platform } from '../../mockData';

// Read-mostly analytics state for the dashboard, revenue, and platform-stats screens.
// A real integration would populate this via async thunks hitting the Flask API.
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    overview,
    revenue,
    platform,
    revenueRange: 'Month', // Week | Month | Quarter | Year
  },
  reducers: {
    setRevenueRange(state, action) {
      state.revenueRange = action.payload;
    },
  },
});

export const { setRevenueRange } = analyticsSlice.actions;
export default analyticsSlice.reducer;
