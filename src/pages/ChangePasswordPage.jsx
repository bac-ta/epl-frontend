import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { changePassword, clearAuthError, logout, selectAuth } from '../features/auth/authSlice'
import './LoginPage.css'

// Same rule as the auth service (UserService.MIN_PASSWORD_LENGTH)
const MIN_PASSWORD_LENGTH = 12

export default function ChangePasswordPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { status, error, mustChangePassword } = useSelector(selectAuth)
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [formError, setFormError] = useState(null)

  const from = location.state?.from?.pathname ?? '/'
  const isLoading = status === 'loading'

  useEffect(() => () => dispatch(clearAuthError()), [dispatch])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.newPassword.length < MIN_PASSWORD_LENGTH) {
      return setFormError(`The new password must have at least ${MIN_PASSWORD_LENGTH} characters`)
    }
    if (form.newPassword !== form.confirmPassword) {
      return setFormError('The new passwords do not match')
    }
    setFormError(null)
    const result = await dispatch(changePassword(form))
    if (changePassword.fulfilled.match(result)) {
      navigate(from === '/change-password' ? '/' : from, { replace: true })
    }
  }

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Change password</h1>
        {mustChangePassword && <p>You must choose a new password before you continue.</p>}

        <label>
          Current password
          <input
            name="currentPassword"
            type="password"
            value={form.currentPassword}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
        </label>

        <label>
          New password
          <input
            name="newPassword"
            type="password"
            value={form.newPassword}
            onChange={handleChange}
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            required
          />
        </label>

        <label>
          Confirm new password
          <input
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            required
          />
        </label>

        {(formError ?? error) && <p className="login-error">{formError ?? error}</p>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving…' : 'Change password'}
        </button>
        {mustChangePassword ? (
          <button type="button" className="secondary" onClick={() => dispatch(logout())}>
            Sign out
          </button>
        ) : (
          <button type="button" className="secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
        )}
      </form>
    </div>
  )
}
