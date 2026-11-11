import { beforeEach, describe, expect, it, vi } from 'vitest'

import api from './api'
import {
  discoverFaceit,
  fetchFaceitElo,
  fetchFaceitMaps,
  fetchFaceitMatch,
  fetchFaceitMatches,
  fetchFaceitStatus,
  linkFaceit,
  startFaceitOauth,
  syncFaceit,
  unlinkFaceit,
} from './faceit.js'

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('faceit service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('loads the faceit status', async () => {
    api.get.mockResolvedValue({ data: { linked: true } })

    await expect(fetchFaceitStatus()).resolves.toEqual({ linked: true })
    expect(api.get).toHaveBeenCalledWith('/faceit/status')
  })

  it('discovers a faceit player', async () => {
    api.post.mockResolvedValue({ data: { discovery: { player_id: 'p1' } } })

    await expect(discoverFaceit()).resolves.toEqual({ player_id: 'p1' })
    expect(api.post).toHaveBeenCalledWith('/faceit/discover')
  })

  it('links an explicit player id and an empty payload', async () => {
    api.post.mockResolvedValue({ data: { faceit: { nickname: 'frag' } } })

    await expect(linkFaceit('p1')).resolves.toEqual({ nickname: 'frag' })
    await linkFaceit()
    expect(api.post).toHaveBeenNthCalledWith(1, '/faceit/link', {
      player_id: 'p1',
    })
    expect(api.post).toHaveBeenNthCalledWith(2, '/faceit/link', {})
  })

  it('unlinks the faceit account', async () => {
    api.delete.mockResolvedValue({ data: { faceit: null } })

    await expect(unlinkFaceit()).resolves.toBeNull()
    expect(api.delete).toHaveBeenCalledWith('/faceit/account')
  })

  it('syncs with and without forcing', async () => {
    api.post.mockResolvedValue({ data: { synced: true } })

    await expect(syncFaceit()).resolves.toEqual({ synced: true })
    await syncFaceit({ force: true })
    expect(api.post).toHaveBeenNthCalledWith(1, '/faceit/sync', {})
    expect(api.post).toHaveBeenNthCalledWith(2, '/faceit/sync', { force: true })
  })

  it('starts the oauth flow', async () => {
    api.post.mockResolvedValue({
      data: { authorization_url: 'https://faceit.test/oauth' },
    })

    await expect(startFaceitOauth()).resolves.toBe(
      'https://faceit.test/oauth',
    )
    expect(api.post).toHaveBeenCalledWith('/faceit/oauth/start')
  })

  it('lists matches sending only meaningful filters', async () => {
    api.get.mockResolvedValue({ data: { matches: [], meta: { total: 0 } } })

    await fetchFaceitMatches({
      limit: 10,
      offset: 0,
      map: 'de_dust2',
      result: '',
    })

    expect(api.get).toHaveBeenCalledWith('/faceit/matches', {
      params: { limit: 10, map: 'de_dust2' },
    })
  })

  it('loads a single match with an optional refresh flag', async () => {
    api.get.mockResolvedValue({ data: { match: { id: 'm1' } } })

    await expect(fetchFaceitMatch('m1')).resolves.toEqual({ id: 'm1' })
    await fetchFaceitMatch('m1', { refresh: true })
    expect(api.get).toHaveBeenNthCalledWith(1, '/faceit/matches/m1', {
      params: undefined,
    })
    expect(api.get).toHaveBeenNthCalledWith(2, '/faceit/matches/m1', {
      params: { refresh: true },
    })
  })

  it('loads maps and elo', async () => {
    api.get
      .mockResolvedValueOnce({ data: { maps: [{ name: 'de_mirage' }] } })
      .mockResolvedValueOnce({ data: { elo: 2100 } })

    await expect(fetchFaceitMaps()).resolves.toEqual([{ name: 'de_mirage' }])
    await expect(fetchFaceitElo()).resolves.toEqual({ elo: 2100 })
    expect(api.get).toHaveBeenNthCalledWith(1, '/faceit/maps')
    expect(api.get).toHaveBeenNthCalledWith(2, '/faceit/elo')
  })

  it('propagates oauth failures', async () => {
    api.post.mockRejectedValue(new Error('502 upstream'))

    await expect(startFaceitOauth()).rejects.toThrow('502 upstream')
  })
})
