import { configureStore } from '@reduxjs/toolkit'
import authReducer, { sessionSynced } from '../features/auth/authSlice'
import { setupInterceptors } from '../api/setupInterceptors'
import { SESSION_KEY, sessionStorage } from '../utils/storage'

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
})

setupInterceptors(store)

// Tabs share one session: a refresh token rotated by one tab is revoked for the others, and
// reusing it would end the session everywhere (reuse detection), so follow the other tabs' changes.
window.addEventListener('storage', (event) => {
  if (event.key === SESSION_KEY || event.key === null) {
    store.dispatch(sessionSynced(sessionStorage.get()))
  }
})
