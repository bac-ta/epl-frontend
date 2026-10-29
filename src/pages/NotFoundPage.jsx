import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section style={{ padding: 24 }}>
      <h1>404 – Page not found</h1>
      <Link to="/">Go home</Link>
    </section>
  )
}
