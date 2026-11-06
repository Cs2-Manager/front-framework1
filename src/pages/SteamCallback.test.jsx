import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import SteamCallback from './SteamCallback.jsx'
import { exchangeSteamHandoff } from '../services/steam.js'

const mocks = vi.hoisted(() => ({ loginWithToken: vi.fn() }))

vi.mock('../services/steam.js', () => ({
  exchangeSteamHandoff: vi.fn(),
}))
vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: () => ({ loginWithToken: mocks.loginWithToken }),
}))

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/steam/callback" element={<SteamCallback />} />
        <Route path="/profile" element={<p>Perfil cargado</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('SteamCallback page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('exchanges the handoff, stores the session and redirects to the profile', async () => {
    exchangeSteamHandoff.mockResolvedValue({
      token: 'jwt-steam',
      user: { id: 7, username: 'steam_user' },
      intent: 'LOGIN',
      created: true,
    })

    renderAt('/steam/callback?handoff=abc123')

    await waitFor(() =>
      expect(mocks.loginWithToken).toHaveBeenCalledWith('jwt-steam', {
        id: 7,
        username: 'steam_user',
      }),
    )
    expect(exchangeSteamHandoff).toHaveBeenCalledWith('abc123')
    expect(await screen.findByText('Perfil cargado')).toBeInTheDocument()
  })

  it('shows a clear message for each Steam error code', () => {
    renderAt('/steam/callback?error=account_conflict')

    expect(
      screen.getByText(/ya está vinculada a otro usuario/),
    ).toBeInTheDocument()
    expect(exchangeSteamHandoff).not.toHaveBeenCalled()
  })

  it('rejects a callback without handoff or error', () => {
    renderAt('/steam/callback')

    expect(
      screen.getByText(/No recibimos una respuesta válida de Steam/),
    ).toBeInTheDocument()
    expect(exchangeSteamHandoff).not.toHaveBeenCalled()
  })

  it('shows the API error when the exchange fails', async () => {
    exchangeSteamHandoff.mockRejectedValue({
      response: { data: { error: 'El enlace ya fue utilizado.' } },
    })

    renderAt('/steam/callback?handoff=used')

    expect(
      await screen.findByText('El enlace ya fue utilizado.'),
    ).toBeInTheDocument()
    expect(mocks.loginWithToken).not.toHaveBeenCalled()
  })

  it('does not request the same handoff twice', async () => {
    exchangeSteamHandoff.mockResolvedValue({
      token: 'jwt-steam',
      user: { id: 7 },
      intent: 'LINK',
      created: false,
    })

    renderAt('/steam/callback?handoff=once')

    await screen.findByText('Perfil cargado')
    expect(exchangeSteamHandoff).toHaveBeenCalledTimes(1)
  })

  it('offers a way back to login after an error', () => {
    renderAt('/steam/callback?error=invalid_state')

    expect(
      screen.getByRole('link', { name: 'Volver a iniciar sesión' }),
    ).toHaveAttribute('href', '/login')
    expect(
      screen.getByRole('link', { name: 'Ir al inicio' }),
    ).toHaveAttribute('href', '/')
  })
})
