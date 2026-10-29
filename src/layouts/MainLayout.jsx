import { useDispatch, useSelector } from 'react-redux'
import { Link, Outlet } from 'react-router-dom'
import { logout, selectDisplayName } from '../features/auth/authSlice'
import './MainLayout.css'

export default function MainLayout() {
  const dispatch = useDispatch()
  const displayName = useSelector(selectDisplayName)

  return (
    <div className="main-layout">
      <header className="main-header">
        <Link to="/" className="brand">EPL</Link>
        <div className="user-box">
          <span>{displayName ?? 'User'}</span>
          <Link to="/change-password">Change password</Link>
          <button type="button" onClick={() => dispatch(logout())}>Logout</button>
        </div>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
