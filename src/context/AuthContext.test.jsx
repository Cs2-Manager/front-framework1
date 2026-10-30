import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AUTH_TOKEN_KEY } from '../services/api.js'
import {
  fetchCurrentUser,
  login as loginRequest,
} from '../services/auth.js'
import { AuthProvider, useAuth } from './AuthContext.jsx'

vi.mock('../services/auth.js', () => ({
  login: vi.fn(),
  register: vi.fn(),
  fetchCurrentUser: vi.fn(),
}))

function Consumer() {
  const { user, initializing, isAuthenticated, login, logout } = useAuth()
  const status = initializing
    ? 'initializing'
    : isAuthenticated
      ? user.username
      : 'anonymous'

  return (
    <div>
      <span data-testid="status">{status}</span>
      <button
        type="button"
        onClick={() => login({ email: 'ana@example.com', password: 'secret' })}
      >
        Ingresar
      </button>
      <button type="button" onClick={logout}>
        Salir
      </button>
    </div>
  )
}

function renderProvider() {
  return render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>,
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetAllMocks()
  })

  it('starts anonymous when there is no stored token', () => {
    renderProvider()

    expect(screen.getByTestId('status')).toHaveTextContent('anonymous')
    expect(fetchCurrentUser).not.toHaveBeenCalled()
  })

  it('stores the token and user after login', async () => {
    loginRequest.mockResolvedValue({
      token: 'tok-1',
      user: { username: 'ana' },
    })
    renderProvider()

    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }))

    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('ana'),
    )
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe('tok-1')
  })

  it('restores the session from a stored token', async () => {
    localStorage.setItem(AUTH_TOKEN_KEY, 'tok-2')
    fetchCurrentUser.mockResolvedValue({ user: { username: 'leo' } })
    renderProvider()

    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('leo'),
    )
  })

  it('clears the session on logout', async () => {
    localStorage.setItem(AUTH_TOKEN_KEY, 'tok-3')
    fetchCurrentUser.mockResolvedValue({ user: { username: 'leo' } })
    renderProvider()

    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('leo'),
    )

    fireEvent.click(screen.getByRole('button', { name: 'Salir' }))

    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('anonymous'),
    )
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull()
  })

  it('logs out when the stored token is rejected', async () => {
    localStorage.setItem(AUTH_TOKEN_KEY, 'bad-token')
    fetchCurrentUser.mockRejectedValue(new Error('401'))
    renderProvider()

    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('anonymous'),
    )
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull()
  })
})
