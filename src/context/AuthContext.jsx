import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { AUTH_TOKEN_KEY, setUnauthorizedHandler } from '../services/api.js'
import {
  login as loginRequest,
  register as registerRequest,
  fetchCurrentUser,
} from '../services/auth.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(
    () => localStorage.getItem(AUTH_TOKEN_KEY) || null,
  )
  const [initializing, setInitializing] = useState(
    () => Boolean(localStorage.getItem(AUTH_TOKEN_KEY)),
  )

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    if (!initializing) return undefined
    let active = true
    fetchCurrentUser()
      .then(({ user: currentUser }) => {
        if (active) setUser(currentUser)
      })
      .catch(() => {
        if (active) logout()
      })
      .finally(() => {
        if (active) setInitializing(false)
      })
    return () => {
      active = false
    }
  }, [initializing, logout])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      localStorage.removeItem(AUTH_TOKEN_KEY)
      setToken(null)
      setUser(null)
      window.location.replace('/login')
    })
    return () => setUnauthorizedHandler(null)
  }, [])

  const login = useCallback(async (credentials) => {
    const data = await loginRequest(credentials)
    localStorage.setItem(AUTH_TOKEN_KEY, data.token)
    setToken(data.token)
    setUser(data.user)
    return data
  }, [])

  const register = useCallback(async (payload) => {
    const data = await registerRequest(payload)
    if (data.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, data.token)
      setToken(data.token)
      setUser(data.user)
    }
    return data
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      initializing,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [user, token, initializing, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>.')
  }
  return context
}