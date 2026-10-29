import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import { selectIsAuthenticated } from '../features/auth/authSlice'

// For pages like /login that logged-in users shouldn't see.
export default function PublicRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />
}
