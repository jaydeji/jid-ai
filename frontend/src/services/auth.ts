const AUTH_KEY = 'basic_auth_token'

export const setAuth = (email: string, password: string) => {
  const token = btoa(`${email}:${password}`)
  sessionStorage.setItem(AUTH_KEY, token)
}

export const clearAuth = () => {
  sessionStorage.removeItem(AUTH_KEY)
}

export const getAuthHeader = (): string | null => {
  const token = sessionStorage.getItem(AUTH_KEY)
  return token ? `Basic ${token}` : null
}

export const isLoggedIn = (): boolean => {
  return !!sessionStorage.getItem(AUTH_KEY)
}

/**
 * Returns a best-effort username from the stored token (for UI show).
 * May return null if not present.
 */
export const getStoredEmail = (): string | null => {
  const token = sessionStorage.getItem(AUTH_KEY)
  if (!token) return null
  try {
    const decoded = atob(token)
    const [email] = decoded.split(':')
    return email || null
  } catch {
    return null
  }
}
