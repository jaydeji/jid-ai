const AUTH_KEY = 'token'

export const setAuth = (token: string) => {
  sessionStorage.setItem(AUTH_KEY, token)
}

export const clearAuth = () => {
  sessionStorage.removeItem(AUTH_KEY)
}

export const getAuthHeader = (): string | null => {
  const token = sessionStorage.getItem(AUTH_KEY)
  return token ? `Bearer ${token}` : null
}

export const isLoggedIn = (): boolean => {
  return !!sessionStorage.getItem(AUTH_KEY)
}
