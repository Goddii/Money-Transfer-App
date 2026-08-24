import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import analyticsReducer from './slices/analyticsSlice'
import usersReducer from './slices/usersSlice'
import auditReducer from './slices/auditSlice'
import walletsReducer from './slices/walletsSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    analytics: analyticsReducer,
    users: usersReducer,
    audit: auditReducer,
    wallets: walletsReducer
  }
})

export default store
