// Decodes the JWT payload without verifying the signature (verification is the backend's job).
export function decodeJwt(token) {
  try {
    const payload = token.split('.')[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decodeURIComponent(escape(json)))
  } catch {
    return null
  }
}

export function isTokenExpired(token) {
  const payload = token && decodeJwt(token)
  if (!payload) return true
  if (!payload.exp) return false
  return payload.exp * 1000 <= Date.now()
}
