import { beforeEach, describe, expect, it, vi } from 'vitest'

import api from './api'
import {
  WORKSHOP_CATEGORIES,
  createWorkshopMap,
  deleteWorkshopMap,
  fetchWorkshopMap,
  fetchWorkshopMaps,
  updateWorkshopMap,
} from './workshopMaps.js'

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('workshop maps service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('exposes the supported workshop categories', () => {
    expect(WORKSHOP_CATEGORIES).toEqual([
      'Aim',
      'Recoil',
      'Crosshair',
      'HUD',
      'Warmup',
    ])
  })

  it('lists workshop maps with filters', async () => {
    api.get.mockResolvedValue({ data: { workshop_maps: [{ id: 1 }] } })

    await expect(
      fetchWorkshopMaps({ category: 'Aim', search: 'spray' }),
    ).resolves.toEqual([{ id: 1 }])
    expect(api.get).toHaveBeenCalledWith('/workshop-maps', {
      params: { category: 'Aim', search: 'spray' },
    })
  })

  it('lists with an empty filter object by default', async () => {
    api.get.mockResolvedValue({ data: { workshop_maps: [] } })

    await fetchWorkshopMaps()

    expect(api.get).toHaveBeenCalledWith('/workshop-maps', { params: {} })
  })

  it('loads a single workshop map', async () => {
    api.get.mockResolvedValue({ data: { workshop_map: { id: 2 } } })

    await expect(fetchWorkshopMap(2)).resolves.toEqual({ id: 2 })
    expect(api.get).toHaveBeenCalledWith('/workshop-maps/2')
  })

  it('creates and updates workshop maps', async () => {
    api.post.mockResolvedValue({ data: { workshop_map: { id: 3 } } })
    api.put.mockResolvedValue({ data: { workshop_map: { id: 3, name: 'B' } } })

    await expect(createWorkshopMap({ name: 'A' })).resolves.toEqual({ id: 3 })
    await expect(updateWorkshopMap(3, { name: 'B' })).resolves.toEqual({
      id: 3,
      name: 'B',
    })
    expect(api.post).toHaveBeenCalledWith('/workshop-maps', { name: 'A' })
    expect(api.put).toHaveBeenCalledWith('/workshop-maps/3', { name: 'B' })
  })

  it('deletes a workshop map', async () => {
    api.delete.mockResolvedValue({})

    await expect(deleteWorkshopMap(3)).resolves.toBeUndefined()
    expect(api.delete).toHaveBeenCalledWith('/workshop-maps/3')
  })

  it('propagates validation errors', async () => {
    api.post.mockRejectedValue(new Error('422 invalid'))

    await expect(createWorkshopMap({})).rejects.toThrow('422 invalid')
  })
})
