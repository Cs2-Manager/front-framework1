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

function readStoredToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY) || null
}

function clearSession(setToken, setUser) {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  setToken(null)
  setUser(null)
}

function useSessionLogin(setToken, setUser) {
  return useCallback(
    async (credentials) => {
      const data = await loginRequest(credentials)
      localStorage.setItem(AUTH_TOKEN_KEY, data.token)
      setToken(data.token)
      setUser(data.user)
      return data
    },
    [setToken, setUser],
  )
}

function useSessionLoginWithToken(setToken, setUser) {
  return useCallback(
    (token, user) => {
      if (!token) {
        throw new Error('El inicio de sesión con Steam no devolvió un token.')
      }
      localStorage.setItem(AUTH_TOKEN_KEY, token)
      setToken(token)
      setUser(user)
    },
    [setToken, setUser],
  )
}

function useSessionRegister(setToken, setUser) {
  return useCallback(
    async (payload) => {
      const data = await registerRequest(payload)
      if (data.token) {
        localStorage.setItem(AUTH_TOKEN_KEY, data.token)
        setToken(data.token)
        setUser(data.user)
      }
      return data
    },
    [setToken, setUser],
  )
}

function useSessionRestore({ initializing, setInitializing, setUser, logout }) {
  useEffect(() => {
    if (!initializing) return undefined
    let active = true
    const guard = (fn) => (...args) => active && fn(...args)
    fetchCurrentUser()
      .then(guard(({ user: currentUser }) => setUser(currentUser)))
      .catch(guard(() => logout()))
      .finally(guard(() => setInitializing(false)))
    return () => {
      active = false
    }
  }, [initializing, setUser, setInitializing, logout])
}

function useUnauthorizedHandler() {
  useEffect(() => {
    setUnauthorizedHandler(() => {
      localStorage.removeItem(AUTH_TOKEN_KEY)
      window.location.replace('/login')
    })
    return () => setUnauthorizedHandler(null)
  }, [])
}

function useSession() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(readStoredToken)
  const [initializing, setInitializing] = useState(() => Boolean(readStoredToken()))

  const logout = useCallback(() => clearSession(setToken, setUser), [])

  useSessionRestore({ initializing, setInitializing, setUser, logout })

  const login = useSessionLogin(setToken, setUser)
  const loginWithToken = useSessionLoginWithToken(setToken, setUser)
  const register = useSessionRegister(setToken, setUser)

  return {
    user,
    token,
    initializing,
    login,
    loginWithToken,
    register,
    logout,
  }
}

export function AuthProvider({ children }) {
  const { user, token, initializing, login, loginWithToken, register, logout } =
    useSession()

  useUnauthorizedHandler()

  const value = useMemo(
    () => ({
      user,
      token,
      initializing,
      isAuthenticated: Boolean(user),
      login,
      loginWithToken,
      register,
      logout,
    }),
    [user, token, initializing, login, loginWithToken, register, logout],
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
