const AUTH_KEY = 'basic_auth_token'

export const setAuth = (username: string, password: string) => {
  const token = btoa(`${username}:${password}`)
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
export const getStoredUsername = (): string | null => {
  const token = sessionStorage.getItem(AUTH_KEY)
  if (!token) return null
  try {
    const decoded = atob(token)
    const [username] = decoded.split(':')
    return username || null
  } catch {
    return null
  }
}
