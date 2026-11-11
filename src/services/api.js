import axios from 'axios'

export const AUTH_TOKEN_KEY = 'cs2_auth_token'

// La API se consume con rutas relativas: el navegador habla con el mismo
// origen que sirve la SPA (nginx), que reenvía /api/ al backend. Sin rutas
// absolutas el cliente funciona en cualquier red sin cambios de código.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

let unauthorizedHandler = null

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    const authorization = error.config?.headers?.Authorization
    // An old/anonymous request must not invalidate a subsequently opened session.
    if (error.response?.status === 401 && token && authorization === `Bearer ${token}`) {
      unauthorizedHandler?.(error)
    }
    return Promise.reject(error)
  },
)

export default api
