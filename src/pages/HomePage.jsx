import { useSelector } from 'react-redux'
import { selectDisplayName } from '../features/auth/authSlice'

export default function HomePage() {
  const displayName = useSelector(selectDisplayName)

  return (
    <section>
      <h1>Home</h1>
      <p>Welcome, {displayName ?? 'user'}.</p>
    </section>
  )
}
