import axiosClient from './axiosClient'
import { authApi, PUBLIC_AUTH_PATHS } from '../features/auth/authApi'
import { clearSession, sessionRefreshed } from '../features/auth/authSlice'

// The store is injected here (instead of imported in axiosClient) to avoid a circular import.
export function setupInterceptors(store) {
  // One refresh at a time: concurrent 401s wait for the same call
  let refreshing = null

  const refreshSession = () => {
    refreshing ??= authApi
      .refresh(store.getState().auth.refreshToken)
      .then((session) => {
        store.dispatch(sessionRefreshed(session))
        return session.accessToken
      })
      .finally(() => {
        refreshing = null
      })
    return refreshing
  }

  axiosClient.interceptors.request.use((config) => {
    const { accessToken } = store.getState().auth
    if (accessToken && !PUBLIC_AUTH_PATHS.includes(config.url)) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  })

  axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const original = error.config
      const isAuthCall = PUBLIC_AUTH_PATHS.includes(original?.url)

      if (error.response?.status !== 401 || isAuthCall || original._retried) {
        return Promise.reject(error)
      }

      if (!store.getState().auth.refreshToken) {
        store.dispatch(clearSession())
        return Promise.reject(error)
      }

      try {
        const accessToken = await refreshSession()
        original._retried = true
        original.headers.Authorization = `Bearer ${accessToken}`
        return axiosClient(original)
      } catch {
        store.dispatch(clearSession())
        return Promise.reject(error)
      }
    },
  )
}
