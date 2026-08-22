import axios from 'axios'
import store from '../store/store'
import { logout } from '../store/authSlice'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Centralized response handling.
// 401: the token is missing/expired/invalid. Clear auth state and send the
// user back to login so the app does not silently render stale defaults.
// 403: leave it to the calling component's error state so it is shown as an
// explicit unauthorized state rather than being treated as empty/zero data.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    if (status === 401) {
      store.dispatch(logout())
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  }
)

export default api
