import { beforeEach, describe, expect, it, vi } from 'vitest'

import api from './api'
import {
  exchangeSteamHandoff,
  fetchSteamStatus,
  getSteamLoginUrl,
  startSteamLink,
  syncSteam,
  unlinkSteam,
} from './steam.js'

vi.mock('./api', () => ({
  default: {
    defaults: { baseURL: '/api' },
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('steam service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('builds the browser login URL from the API base', () => {
    expect(getSteamLoginUrl()).toBe('/api/auth/steam/start')
  })

  it('exchanges a handoff for a platform session', async () => {
    const payload = { token: 'jwt', user: { id: 1 }, intent: 'LOGIN' }
    api.post.mockResolvedValue({ data: payload })

    await expect(exchangeSteamHandoff('handoff-1')).resolves.toEqual(payload)
    expect(api.post).toHaveBeenCalledWith('/auth/steam/exchange', {
      handoff: 'handoff-1',
    })
  })

  it('loads the authenticated Steam status', async () => {
    const steam = { linked: false }
    api.get.mockResolvedValue({ data: { steam } })

    await expect(fetchSteamStatus()).resolves.toEqual(steam)
    expect(api.get).toHaveBeenCalledWith('/steam/status')
  })

  it('requests a link authorization URL', async () => {
    api.post.mockResolvedValue({
      data: { authorization_url: 'https://steamcommunity.com/openid/login?x=1' },
    })

    await expect(startSteamLink()).resolves.toContain(
      'steamcommunity.com/openid/login',
    )
    expect(api.post).toHaveBeenCalledWith('/steam/link')
  })

  it('unlinks the Steam account and returns the new section', async () => {
    api.delete.mockResolvedValue({ data: { steam: { linked: false } } })

    await expect(unlinkSteam()).resolves.toEqual({ linked: false })
    expect(api.delete).toHaveBeenCalledWith('/steam/account')
  })

  it('requests a manual synchronization', async () => {
    const payload = { sync: { status: 'OK' }, steam: { linked: true } }
    api.post.mockResolvedValue({ data: payload })

    await expect(syncSteam()).resolves.toEqual(payload)
    expect(api.post).toHaveBeenCalledWith('/steam/sync')
  })
})
