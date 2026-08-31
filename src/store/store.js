import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import analyticsReducer from './slices/analyticsSlice'
import usersReducer from './slices/usersSlice'
import auditReducer from './slices/auditSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    analytics: analyticsReducer,
    users: usersReducer,
    audit: auditReducer,
  }
})

export default store
