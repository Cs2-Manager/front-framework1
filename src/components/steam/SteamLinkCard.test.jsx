import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import SteamLinkCard from './SteamLinkCard.jsx'
import { startSteamLink } from '../../services/steam.js'

vi.mock('../../services/steam.js', () => ({
  startSteamLink: vi.fn(),
}))

describe('SteamLinkCard', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('starts the link flow and redirects to Steam', async () => {
    const redirect = vi.fn()
    startSteamLink.mockResolvedValue(
      'https://steamcommunity.com/openid/login?x=1',
    )

    render(<SteamLinkCard steam={{ configured: true }} redirect={redirect} />)
    fireEvent.click(
      screen.getByRole('button', { name: /Vincular cuenta de Steam/ }),
    )

    await waitFor(() =>
      expect(redirect).toHaveBeenCalledWith(
        'https://steamcommunity.com/openid/login?x=1',
      ),
    )
    expect(startSteamLink).toHaveBeenCalledTimes(1)
  })

  it('disables the action when the backend is not configured', () => {
    render(<SteamLinkCard steam={{ configured: false }} />)

    expect(
      screen.getByRole('button', { name: /Vincular cuenta de Steam/ }),
    ).toBeDisabled()
    expect(
      screen.getByText(/La integración con Steam no está configurada/),
    ).toBeInTheDocument()
  })

  it('shows server errors without redirecting', async () => {
    const redirect = vi.fn()
    startSteamLink.mockRejectedValue({
      response: { data: { error: 'Steam no disponible' } },
    })

    render(<SteamLinkCard steam={{ configured: true }} redirect={redirect} />)
    fireEvent.click(
      screen.getByRole('button', { name: /Vincular cuenta de Steam/ }),
    )

    expect(await screen.findByText('Steam no disponible')).toBeInTheDocument()
    expect(redirect).not.toHaveBeenCalled()
  })
})
