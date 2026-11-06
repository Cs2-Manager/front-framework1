import { beforeEach, describe, expect, it, vi } from 'vitest'

import api from './api'
import {
  activateTeamLineup,
  createTeamLineup,
  deactivateTeamLineup,
  deleteTeamLineup,
  fetchTeamLineup,
  fetchTeamLineups,
  replaceTeamLineupPlayers,
  setPrimaryTeamLineup,
  updateTeamLineup,
} from './teamLineups.js'

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('teamLineups service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('loads the lineups of a team with limits and meta', async () => {
    api.get.mockResolvedValue({
      data: {
        lineups: [{ id: 1 }],
        limits: { starters: 5, substitutes: 5 },
        meta: { total: 1 },
      },
    })

    const result = await fetchTeamLineups(5)

    expect(api.get).toHaveBeenCalledWith('/teams/5/lineups')
    expect(result).toEqual({
      lineups: [{ id: 1 }],
      limits: { starters: 5, substitutes: 5 },
      meta: { total: 1 },
    })
  })

  it('loads a single lineup', async () => {
    api.get.mockResolvedValue({
      data: { lineup: { id: 3 }, limits: { starters: 5 } },
    })

    const result = await fetchTeamLineup(5, 3)

    expect(api.get).toHaveBeenCalledWith('/teams/5/lineups/3')
    expect(result).toEqual({
      lineup: { id: 3 },
      limits: { starters: 5 },
    })
  })

  it('creates and updates lineup metadata', async () => {
    api.post.mockResolvedValue({ data: { lineup: { id: 4 } } })
    api.put.mockResolvedValue({ data: { lineup: { id: 4, name: 'B' } } })

    const created = await createTeamLineup(5, { name: 'A' })
    const updated = await updateTeamLineup(5, 4, { name: 'B' })

    expect(api.post).toHaveBeenCalledWith('/teams/5/lineups', { name: 'A' })
    expect(api.put).toHaveBeenCalledWith('/teams/5/lineups/4', { name: 'B' })
    expect(created).toEqual({ id: 4 })
    expect(updated).toEqual({ id: 4, name: 'B' })
  })

  it('replaces the roster', async () => {
    api.put.mockResolvedValue({ data: { lineup: { id: 4 } } })
    const payload = {
      starters: [{ user_id: 1, role: 'IGL' }],
      substitutes: [],
    }

    await replaceTeamLineupPlayers(5, 4, payload)

    expect(api.put).toHaveBeenCalledWith(
      '/teams/5/lineups/4/players',
      payload,
    )
  })

  it('activates, deactivates and marks a lineup as primary', async () => {
    api.post.mockResolvedValue({ data: { lineup: { id: 4 } } })

    await activateTeamLineup(5, 4)
    await deactivateTeamLineup(5, 4)
    await setPrimaryTeamLineup(5, 4)

    expect(api.post).toHaveBeenNthCalledWith(
      1,
      '/teams/5/lineups/4/activate',
    )
    expect(api.post).toHaveBeenNthCalledWith(
      2,
      '/teams/5/lineups/4/deactivate',
    )
    expect(api.post).toHaveBeenNthCalledWith(
      3,
      '/teams/5/lineups/4/primary',
    )
  })

  it('deletes a lineup', async () => {
    api.delete.mockResolvedValue({})

    await deleteTeamLineup(5, 4)

    expect(api.delete).toHaveBeenCalledWith('/teams/5/lineups/4')
  })
})
