import { beforeEach, describe, expect, it, vi } from 'vitest'

import api from './api'
import { fetchCurrentUser, login, register } from './auth.js'

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('auth service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('posts credentials to the login endpoint', async () => {
    const credentials = { username: 'frag', password: 'secret123' }
    api.post.mockResolvedValue({ data: { token: 'jwt', user: { id: 1 } } })

    await expect(login(credentials)).resolves.toEqual({
      token: 'jwt',
      user: { id: 1 },
    })
    expect(api.post).toHaveBeenCalledWith('/auth/login', credentials)
  })

  it('posts the registration payload', async () => {
    const payload = { username: 'new', password: 'secret123' }
    api.post.mockResolvedValue({ data: { token: 'jwt', user: { id: 2 } } })

    await expect(register(payload)).resolves.toEqual({
      token: 'jwt',
      user: { id: 2 },
    })
    expect(api.post).toHaveBeenCalledWith('/auth/register', payload)
  })

  it('loads the current user from the session token', async () => {
    api.get.mockResolvedValue({ data: { user: { id: 3 } } })

    await expect(fetchCurrentUser()).resolves.toEqual({ user: { id: 3 } })
    expect(api.get).toHaveBeenCalledWith('/auth/me')
  })

  it('rejects invalid credentials', async () => {
    api.post.mockRejectedValue(new Error('401 invalid'))

    await expect(login({ username: 'x', password: 'y' })).rejects.toThrow(
      '401 invalid',
    )
  })
})
