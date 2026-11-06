import { beforeEach, describe, expect, it, vi } from 'vitest'

import api from './api'
import {
  authorizeMatchmaking,
  fetchMatchmakingMatch,
  fetchMatchmakingMatches,
  fetchMatchmakingStatus,
  revokeMatchmaking,
  syncMatchmaking,
  uploadMatchmakingDemo,
} from './matchmaking.js'

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('matchmaking service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('loads the independent matchmaking section', async () => {
    const matchmaking = { status: 'UNAVAILABLE' }
    api.get.mockResolvedValue({ data: { matchmaking } })

    await expect(fetchMatchmakingStatus()).resolves.toEqual(matchmaking)
    expect(api.get).toHaveBeenCalledWith('/matchmaking/status')
  })

  it('sends the authorization codes without extra fields', async () => {
    const matchmaking = { authorized: true }
    api.post.mockResolvedValue({ data: { matchmaking } })

    await expect(
      authorizeMatchmaking({ authCode: 'ABCD-12345-EFGH', shareCode: 'CSGO-X' }),
    ).resolves.toEqual(matchmaking)
    expect(api.post).toHaveBeenCalledWith('/matchmaking/authorization', {
      auth_code: 'ABCD-12345-EFGH',
      share_code: 'CSGO-X',
    })
  })

  it('revokes the authorization', async () => {
    api.delete.mockResolvedValue({ data: { matchmaking: { status: 'REVOKED' } } })

    await expect(revokeMatchmaking()).resolves.toEqual({ status: 'REVOKED' })
    expect(api.delete).toHaveBeenCalledWith('/matchmaking/authorization')
  })

  it('queues a manual sync', async () => {
    const payload = { status: 'QUEUED', sync: { status: 'RUNNING' } }
    api.post.mockResolvedValue({ data: payload })

    await expect(syncMatchmaking()).resolves.toEqual(payload)
    expect(api.post).toHaveBeenCalledWith('/matchmaking/sync')
  })

  it('paginates the history', async () => {
    api.get.mockResolvedValue({ data: { matches: [], count: 0 } })

    await expect(fetchMatchmakingMatches({ limit: 50, offset: 10 })).resolves.toEqual(
      { matches: [], count: 0 },
    )
    expect(api.get).toHaveBeenCalledWith('/matchmaking/matches', {
      params: { limit: 50, offset: 10 },
    })
  })

  it('loads a single match detail', async () => {
    api.get.mockResolvedValue({ data: { match: { id: 7 } } })

    await expect(fetchMatchmakingMatch(7)).resolves.toEqual({ match: { id: 7 } })
    expect(api.get).toHaveBeenCalledWith('/matchmaking/matches/7')
  })

  it('uploads a demo as multipart form data', async () => {
    api.post.mockResolvedValue({ data: { status: 'QUEUED' } })
    const file = new File(['demo'], 'match730_1.dem', {
      type: 'application/octet-stream',
    })

    await expect(uploadMatchmakingDemo(file)).resolves.toEqual({
      status: 'QUEUED',
    })

    const [url, body, options] = api.post.mock.calls[0]
    expect(url).toBe('/matchmaking/demos')
    expect(body).toBeInstanceOf(FormData)
    expect(body.get('demo')).toBe(file)
    expect(options.headers).toEqual({ 'Content-Type': 'multipart/form-data' })
    expect(options.timeout).toBe(5 * 60 * 1000)
  })
})
