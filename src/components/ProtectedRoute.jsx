import { useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { selectIsAuthenticated, selectMustChangePassword } from '../features/auth/authSlice'

const CHANGE_PASSWORD_PATH = '/change-password'

export default function ProtectedRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const mustChangePassword = useSelector(selectMustChangePassword)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  // First login / expired password: nothing else until it is changed
  if (mustChangePassword && location.pathname !== CHANGE_PASSWORD_PATH) {
    return <Navigate to={CHANGE_PASSWORD_PATH} replace state={{ from: location }} />
  }
  return <Outlet />
}
