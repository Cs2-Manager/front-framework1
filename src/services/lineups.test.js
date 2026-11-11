import { beforeEach, describe, expect, it, vi } from 'vitest'

import api from './api'
import {
  GRENADE_TYPES,
  SIDES,
  createLineup,
  deleteLineup,
  fetchLineups,
  updateLineup,
} from './lineups.js'

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('lineups service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('exposes the legacy grenade and side catalogues', () => {
    expect(GRENADE_TYPES).toEqual(['Smoke', 'Molotov', 'Flash', 'HE', 'Decoy'])
    expect(SIDES).toEqual(['TR', 'CT'])
  })

  it('lists lineups with filters', async () => {
    api.get.mockResolvedValue({ data: { lineups: [{ id: 1 }] } })

    await expect(fetchLineups({ map_id: 3 })).resolves.toEqual([{ id: 1 }])
    expect(api.get).toHaveBeenCalledWith('/lineups', { params: { map_id: 3 } })
  })

  it('lists lineups without filters', async () => {
    api.get.mockResolvedValue({ data: { lineups: [] } })

    await fetchLineups()

    expect(api.get).toHaveBeenCalledWith('/lineups', { params: {} })
  })

  it('creates and updates a lineup', async () => {
    api.post.mockResolvedValue({ data: { lineup: { id: 2 } } })
    api.put.mockResolvedValue({ data: { lineup: { id: 2, name: 'B' } } })

    await expect(createLineup({ name: 'A' })).resolves.toEqual({ id: 2 })
    await expect(updateLineup(2, { name: 'B' })).resolves.toEqual({
      id: 2,
      name: 'B',
    })
    expect(api.post).toHaveBeenCalledWith('/lineups', { name: 'A' })
    expect(api.put).toHaveBeenCalledWith('/lineups/2', { name: 'B' })
  })

  it('deletes a lineup', async () => {
    api.delete.mockResolvedValue({})

    await expect(deleteLineup(2)).resolves.toBeUndefined()
    expect(api.delete).toHaveBeenCalledWith('/lineups/2')
  })

  it('propagates forbidden deletions', async () => {
    api.delete.mockRejectedValue(new Error('403 forbidden'))

    await expect(deleteLineup(2)).rejects.toThrow('403 forbidden')
  })
})
