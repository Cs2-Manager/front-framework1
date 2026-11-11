import { beforeEach, describe, expect, it, vi } from 'vitest'

import api from './api'
import {
  deleteStrategy,
  duplicateStrategy,
  fetchPreparation,
  fetchRevisions,
  fetchStrategies,
  restoreStrategy,
  savePreparation,
  saveStrategy,
} from './tactics.js'

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('tactics service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('loads strategies scoped to a map', async () => {
    api.get.mockResolvedValue({ data: { strategies: [{ id: 1 }] } })

    await expect(fetchStrategies(4, 8)).resolves.toEqual([{ id: 1 }])
    expect(api.get).toHaveBeenCalledWith('/teams/4/strategies', {
      params: { map_id: 8 },
    })
  })

  it('creates a strategy when no id is provided', async () => {
    api.post.mockResolvedValue({ data: { strategy: { id: 3 } } })

    await expect(saveStrategy(4, { name: 'A' })).resolves.toEqual({ id: 3 })
    expect(api.post).toHaveBeenCalledWith('/teams/4/strategies', { name: 'A' })
  })

  it('updates an existing strategy', async () => {
    api.put.mockResolvedValue({ data: { strategy: { id: 3, name: 'B' } } })

    await expect(saveStrategy(4, { name: 'B' }, 3)).resolves.toEqual({
      id: 3,
      name: 'B',
    })
    expect(api.put).toHaveBeenCalledWith('/teams/4/strategies/3', {
      name: 'B',
    })
  })

  it('duplicates, lists revisions and restores a revision', async () => {
    api.post
      .mockResolvedValueOnce({ data: { strategy: { id: 5 } } })
      .mockResolvedValueOnce({ data: { strategy: { id: 5, version: 2 } } })
    api.get.mockResolvedValue({ data: { revisions: [{ version: 1 }] } })

    await expect(duplicateStrategy(4, 3)).resolves.toEqual({ id: 5 })
    await expect(fetchRevisions(4, 3)).resolves.toEqual([{ version: 1 }])
    await expect(restoreStrategy(4, 5, 1, 2)).resolves.toEqual({
      id: 5,
      version: 2,
    })
    expect(api.post).toHaveBeenNthCalledWith(
      1,
      '/teams/4/strategies/3/duplicate',
    )
    expect(api.get).toHaveBeenCalledWith('/teams/4/strategies/3/revisions')
    expect(api.post).toHaveBeenNthCalledWith(
      2,
      '/teams/4/strategies/5/restore/1',
      { version: 2 },
    )
  })

  it('deletes a strategy sending the version in the body', async () => {
    api.delete.mockResolvedValue({})

    await deleteStrategy(4, 3, 7)

    expect(api.delete).toHaveBeenCalledWith('/teams/4/strategies/3', {
      data: { version: 7 },
    })
  })

  it('loads and saves map preparation', async () => {
    api.get.mockResolvedValue({ data: { preparation: { id: 1 } } })
    api.put.mockResolvedValue({ data: { preparation: { id: 1, notes: 'x' } } })

    await expect(fetchPreparation(4, 8)).resolves.toEqual({ id: 1 })
    await expect(savePreparation(4, 8, { notes: 'x' })).resolves.toEqual({
      id: 1,
      notes: 'x',
    })
    expect(api.get).toHaveBeenCalledWith('/teams/4/maps/8/preparation')
    expect(api.put).toHaveBeenCalledWith('/teams/4/maps/8/preparation', {
      notes: 'x',
    })
  })

  it('propagates permission errors from the backend', async () => {
    api.get.mockRejectedValue(new Error('403 forbidden'))

    await expect(fetchStrategies(4, 8)).rejects.toThrow('403 forbidden')
  })
})
