import { beforeEach, describe, expect, it, vi } from 'vitest'

import api from './api'
import {
  fetchOwnProfile,
  fetchPlayer,
  fetchPlayerMatches,
  fetchPlayers,
  updateOwnProfile,
} from './profiles.js'

vi.mock('./api', () => ({
  default: { get: vi.fn(), put: vi.fn() },
}))

describe('profiles service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('loads the own profile', async () => {
    const profile = { id: 1, nickname: 'tester' }
    api.get.mockResolvedValue({ data: { profile } })

    await expect(fetchOwnProfile()).resolves.toEqual(profile)
    expect(api.get).toHaveBeenCalledWith('/profile')
  })

  it('updates the own profile', async () => {
    const payload = { nickname: 'nuevo' }
    const profile = { id: 1, nickname: 'nuevo' }
    api.put.mockResolvedValue({ data: { profile } })

    await expect(updateOwnProfile(payload)).resolves.toEqual(profile)
    expect(api.put).toHaveBeenCalledWith('/profile', payload)
  })

  it('omits empty search and pagination params', async () => {
    api.get.mockResolvedValue({
      data: { players: [], meta: { total: 0 } },
    })

    await fetchPlayers({ search: '   ' })

    expect(api.get).toHaveBeenCalledWith('/players', { params: {} })
  })

  it('forwards search and pagination params', async () => {
    api.get.mockResolvedValue({
      data: { players: [{ id: 2 }], meta: { total: 1 } },
    })

    const result = await fetchPlayers({
      search: ' frag ',
      page: 2,
      perPage: 10,
    })

    expect(api.get).toHaveBeenCalledWith('/players', {
      params: { search: 'frag', page: 2, per_page: 10 },
    })
    expect(result).toEqual({ players: [{ id: 2 }], meta: { total: 1 } })
  })

  it('loads a single player profile', async () => {
    const profile = { id: 5, nickname: 'cinco' }
    api.get.mockResolvedValue({ data: { profile } })

    await expect(fetchPlayer(5)).resolves.toEqual(profile)
    expect(api.get).toHaveBeenCalledWith('/players/5')
  })

  it('loads a player match history with pagination', async () => {
    api.get.mockResolvedValue({
      data: { matches: [{ id: 9 }], meta: { total: 1 } },
    })

    const result = await fetchPlayerMatches(5, { page: 1, perPage: 5 })

    expect(api.get).toHaveBeenCalledWith('/players/5/matches', {
      params: { page: 1, per_page: 5 },
    })
    expect(result).toEqual({ matches: [{ id: 9 }], meta: { total: 1 } })
  })
})
