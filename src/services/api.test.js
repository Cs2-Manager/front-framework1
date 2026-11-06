import { afterEach, describe, expect, it, vi } from 'vitest'

import { AUTH_TOKEN_KEY } from './api'

// El módulo crea el cliente axios al importarse; con resetModules + import
// dinámico cada caso arranca con el entorno que necesita.
async function importApi() {
  vi.resetModules()
  return import('./api')
}

describe('api client', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    localStorage.clear()
  })

  it('usa la ruta relativa /api del mismo origen por defecto', async () => {
    vi.stubEnv('VITE_API_URL', '')
    const { default: api } = await importApi()

    expect(api.defaults.baseURL).toBe('/api')
  })

  it('permite apuntar a otro origen mediante VITE_API_URL', async () => {
    vi.stubEnv('VITE_API_URL', 'http://otro-host:5000/api')
    const { default: api } = await importApi()

    expect(api.defaults.baseURL).toBe('http://otro-host:5000/api')
  })

  it('adjunta el token guardado como Bearer en cada pedido', async () => {
    localStorage.setItem(AUTH_TOKEN_KEY, 'jwt-de-prueba')
    const { default: api } = await importApi()

    const config = { headers: {} }
    await api.interceptors.request.handlers[0].fulfilled(config)

    expect(config.headers.Authorization).toBe('Bearer jwt-de-prueba')
  })

  it('no envía Authorization cuando no hay sesión', async () => {
    const { default: api } = await importApi()

    const config = { headers: {} }
    await api.interceptors.request.handlers[0].fulfilled(config)

    expect(config.headers.Authorization).toBeUndefined()
  })

  it('avisa a la app ante un 401 con sesión activa', async () => {
    localStorage.setItem(AUTH_TOKEN_KEY, 'jwt-de-prueba')
    const { default: api, setUnauthorizedHandler } = await importApi()
    const onUnauthorized = vi.fn()
    setUnauthorizedHandler(onUnauthorized)

    const rejection = { response: { status: 401 } }
    await expect(
      api.interceptors.response.handlers[0].rejected(rejection),
    ).rejects.toBe(rejection)

    expect(onUnauthorized).toHaveBeenCalledWith(rejection)
  })

  it('ignora los 401 cuando no hay sesión iniciada', async () => {
    const { default: api, setUnauthorizedHandler } = await importApi()
    const onUnauthorized = vi.fn()
    setUnauthorizedHandler(onUnauthorized)

    const rejection = { response: { status: 401 } }
    await expect(
      api.interceptors.response.handlers[0].rejected(rejection),
    ).rejects.toBe(rejection)

    expect(onUnauthorized).not.toHaveBeenCalled()
  })
})
