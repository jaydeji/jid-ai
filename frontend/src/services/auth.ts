const AUTH_KEY = 'token'

export const setAuth = (token: string) => {
  localStorage.setItem(AUTH_KEY, token)
}

export const clearAuth = () => {
  localStorage.removeItem(AUTH_KEY)
}

export const getAuthHeader = (): string | null => {
  const token = localStorage.getItem(AUTH_KEY)
  return token ? `Bearer ${token}` : null
}

export const isLoggedIn = (): boolean => {
  return !!localStorage.getItem(AUTH_KEY)
}
