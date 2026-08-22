import { configureStore } from '@reduxjs/toolkit';
import usersReducer from '../features/admin/usersSlice';
import analyticsReducer from '../features/admin/analyticsSlice';
import auditReducer from '../features/admin/auditSlice';
import walletsReducer from '../features/admin/walletsSlice';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    users: usersReducer,
    analytics: analyticsReducer,
    audit: auditReducer,
    wallets: walletsReducer,
    auth: authReducer,
  },
});
