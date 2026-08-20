import { configureStore } from '@reduxjs/toolkit';
import usersReducer from './slices/usersSlice';
import analyticsReducer from './slices/analyticsSlice';
import auditReducer from './slices/auditSlice';

export const store = configureStore({
  reducer: {
    users: usersReducer,
    analytics: analyticsReducer,
    audit: auditReducer,
  },
});
