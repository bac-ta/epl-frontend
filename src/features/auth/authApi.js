import { rpc } from '../../api/rpc'
import { CLIENT_ID } from '../../config/env'

const AUTH_SERVICE = 'epl.auth.v1.AuthService'
const USER_SERVICE = 'epl.auth.v1.UserService'

// Public RPCs: the gateway lets them through without a JWT (Logout: the refresh token is the credential)
export const PUBLIC_AUTH_PATHS = ['Login', 'Refresh', 'Logout'].map((method) => `/rpc/${AUTH_SERVICE}/${method}`)

function toSession(token) {
  return {
    accessToken: token.accessToken,
    refreshToken: token.refreshToken ?? null,
    expiresAt: token.expiresInSeconds ? Date.now() + token.expiresInSeconds * 1000 : null,
    mustChangePassword: Boolean(token.mustChangePassword),
  }
}

export const authApi = {
  login: async ({ username, password }) =>
    toSession(await rpc(AUTH_SERVICE, 'Login', { username, password, clientId: CLIENT_ID })),

  refresh: async (refreshToken) =>
    toSession(await rpc(AUTH_SERVICE, 'Refresh', { refreshToken, clientId: CLIENT_ID })),

  logout: (refreshToken, allSessions = false) => rpc(AUTH_SERVICE, 'Logout', { refreshToken, allSessions }),

  // Ends every session of the user on the backend: sign in again afterwards
  changePassword: ({ userId, currentPassword, newPassword }) =>
    rpc(USER_SERVICE, 'ChangePassword', { userId, currentPassword, newPassword }),
}
