import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { authApi } from './authApi'
import { getApiErrorMessage } from '../../api/rpc'
import { decodeJwt, isTokenExpired } from '../../utils/jwt'
import { sessionStorage } from '../../utils/storage'

const emptySession = { accessToken: null, refreshToken: null, expiresAt: null, mustChangePassword: false, user: null }

function toState(session) {
  return { ...session, user: decodeJwt(session.accessToken) }
}

function loadInitialState() {
  const session = sessionStorage.get()
  // An expired access token is kept while a refresh token can still renew it
  if (!session?.accessToken || (isTokenExpired(session.accessToken) && !session.refreshToken)) {
    sessionStorage.remove()
    return emptySession
  }
  return toState(session)
}

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    return await authApi.login(credentials)
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Login failed'))
  }
})

// The backend revokes every session on a password change, so sign in again with the new password
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { getState, dispatch, rejectWithValue }) => {
    const { user } = getState().auth
    try {
      await authApi.changePassword({ userId: user?.sub, currentPassword, newPassword })
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Password change failed'))
    }
    const result = await dispatch(login({ username: user?.usr, password: newPassword }))
    if (login.rejected.match(result)) return rejectWithValue(result.payload)
  },
)

export const logout = createAsyncThunk('auth/logout', async (_, { getState, dispatch }) => {
  const { refreshToken } = getState().auth
  dispatch(clearSession())
  if (refreshToken) {
    // Best effort: the local session is gone even if the backend call fails
    await authApi.logout(refreshToken).catch(() => {})
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    ...loadInitialState(),
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    sessionRefreshed(state, action) {
      Object.assign(state, toState(action.payload))
      sessionStorage.set(action.payload)
    },
    clearSession(state) {
      Object.assign(state, emptySession, { status: 'idle', error: null })
      sessionStorage.remove()
    },
    clearAuthError(state) {
      state.error = null
    },
    // Another tab signed in, refreshed or signed out: adopt its session (storage is already up to date)
    sessionSynced(state, action) {
      Object.assign(state, action.payload ? toState(action.payload) : emptySession, { status: 'idle', error: null })
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        Object.assign(state, toState(action.payload), { status: 'succeeded' })
        sessionStorage.set(action.payload)
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Login failed'
      })
      .addCase(changePassword.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Password change failed'
      })
  },
})

export const { sessionRefreshed, clearSession, clearAuthError, sessionSynced } = authSlice.actions

export const selectAuth = (state) => state.auth
export const selectCurrentUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => Boolean(state.auth.accessToken)
export const selectMustChangePassword = (state) => state.auth.mustChangePassword

// JWT claims (auth service): "usr" username, "name" display name, "sub" user id
export const selectUsername = (state) => state.auth.user?.usr ?? state.auth.user?.sub ?? null
export const selectDisplayName = (state) => state.auth.user?.name ?? selectUsername(state)

export default authSlice.reducer
