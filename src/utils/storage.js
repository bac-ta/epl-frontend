export const SESSION_KEY = 'auth_session'

// Session = { accessToken, refreshToken, expiresAt, mustChangePassword }
export const sessionStorage = {
  get: () => {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY))
    } catch {
      return null
    }
  },
  set: (session) => localStorage.setItem(SESSION_KEY, JSON.stringify(session)),
  remove: () => localStorage.removeItem(SESSION_KEY),
}
