import { beforeEach, describe, expect, it, vi } from 'vitest'

import api from './api'
import {
  GRENADE_SCOPES,
  LINEUP_STATUS_LABELS,
  PROPOSAL_STATUS_LABELS,
  SCOPE_LABELS,
  approveGrenadeProposal,
  archiveGrenadeLineup,
  cancelGrenadeProposal,
  createGrenadeLineup,
  deleteGrenadeLineup,
  fetchGrenadeFavorites,
  fetchGrenadeLineup,
  fetchGrenadeProposal,
  fetchGrenadeRevisions,
  fetchMapGrenadeLineups,
  fetchMyGrenadeProposals,
  fetchPersonalGrenadeLineups,
  fetchTeamGrenadeLineups,
  fetchTeamGrenadeProposals,
  proposeGrenadeLineup,
  publishGrenadeLineup,
  rejectGrenadeProposal,
  restoreGrenadeRevision,
  setGrenadeFavorite,
  updateGrenadeLineup,
} from './grenadeLineups.js'

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('grenade lineups service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('exposes scope and status catalogues', () => {
    expect(GRENADE_SCOPES).toEqual(['OFFICIAL', 'PERSONAL', 'TEAM'])
    expect(SCOPE_LABELS.TEAM).toBe('Equipo')
    expect(LINEUP_STATUS_LABELS.ARCHIVED).toBe('Archivada')
    expect(PROPOSAL_STATUS_LABELS.REJECTED).toBe('Rechazada')
  })

  it('loads map lineups with the default official scope', async () => {
    api.get.mockResolvedValue({ data: { lineups: [{ id: 1 }] } })

    await expect(fetchMapGrenadeLineups(3)).resolves.toEqual([{ id: 1 }])
    expect(api.get).toHaveBeenCalledWith('/maps/3/lineups', {
      params: { scope: 'OFFICIAL' },
    })
  })

  it('drops empty query params but keeps the scope', async () => {
    api.get.mockResolvedValue({ data: { lineups: [] } })

    await fetchMapGrenadeLineups(3, {
      scope: 'TEAM',
      search: '',
      type: 'SMOKE',
      side: null,
    })

    expect(api.get).toHaveBeenCalledWith('/maps/3/lineups', {
      params: { type: 'SMOKE', scope: 'TEAM' },
    })
  })

  it('loads personal and team lineups', async () => {
    api.get
      .mockResolvedValueOnce({ data: { lineups: [{ id: 2 }] } })
      .mockResolvedValueOnce({ data: { lineups: [{ id: 3 }] } })

    await expect(
      fetchPersonalGrenadeLineups({ search: 'smoke', side: '' }),
    ).resolves.toEqual([{ id: 2 }])
    await expect(fetchTeamGrenadeLineups(4, { status: 'PUBLISHED' })).resolves.toEqual(
      [{ id: 3 }],
    )
    expect(api.get).toHaveBeenNthCalledWith(1, '/grenade-lineups/personal', {
      params: { search: 'smoke' },
    })
    expect(api.get).toHaveBeenNthCalledWith(2, '/teams/4/grenade-lineups', {
      params: { status: 'PUBLISHED' },
    })
  })

  it('loads a single lineup', async () => {
    api.get.mockResolvedValue({ data: { lineup: { id: 5 } } })

    await expect(fetchGrenadeLineup(5)).resolves.toEqual({ id: 5 })
    expect(api.get).toHaveBeenCalledWith('/grenade-lineups/5')
  })

  it('creates, updates and deletes lineups', async () => {
    api.post.mockResolvedValue({ data: { lineup: { id: 6 } } })
    api.put.mockResolvedValue({ data: { lineup: { id: 6, title: 'B' } } })
    api.delete.mockResolvedValue({})

    await expect(createGrenadeLineup(3, { title: 'A' })).resolves.toEqual({
      id: 6,
    })
    await expect(
      createGrenadeLineup(3, { title: 'A' }, 'TEAM'),
    ).resolves.toEqual({ id: 6 })
    await expect(updateGrenadeLineup(6, { title: 'B' })).resolves.toEqual({
      id: 6,
      title: 'B',
    })
    await expect(deleteGrenadeLineup(6)).resolves.toBeUndefined()
    expect(api.post).toHaveBeenNthCalledWith(
      1,
      '/maps/3/lineups',
      { title: 'A' },
      { params: { scope: 'PERSONAL' } },
    )
    expect(api.post).toHaveBeenNthCalledWith(
      2,
      '/maps/3/lineups',
      { title: 'A' },
      { params: { scope: 'TEAM' } },
    )
    expect(api.put).toHaveBeenCalledWith('/grenade-lineups/6', { title: 'B' })
    expect(api.delete).toHaveBeenCalledWith('/grenade-lineups/6')
  })

  it('publishes and archives lineups', async () => {
    api.post
      .mockResolvedValueOnce({ data: { lineup: { id: 7, status: 'PUBLISHED' } } })
      .mockResolvedValueOnce({ data: { lineup: { id: 7, status: 'ARCHIVED' } } })

    await expect(publishGrenadeLineup(7)).resolves.toEqual({
      id: 7,
      status: 'PUBLISHED',
    })
    await expect(archiveGrenadeLineup(7)).resolves.toEqual({
      id: 7,
      status: 'ARCHIVED',
    })
    expect(api.post).toHaveBeenNthCalledWith(1, '/grenade-lineups/7/publish')
    expect(api.post).toHaveBeenNthCalledWith(2, '/grenade-lineups/7/archive')
  })

  it('loads revisions and restores a version', async () => {
    api.get.mockResolvedValue({
      data: { revisions: [{ version: 1 }], current_version: 2 },
    })
    api.post.mockResolvedValue({ data: { lineup: { id: 8, version: 1 } } })

    await expect(fetchGrenadeRevisions(8)).resolves.toEqual({
      revisions: [{ version: 1 }],
      current_version: 2,
    })
    await expect(restoreGrenadeRevision(8, 1, { note: 'rollback' })).resolves.toEqual(
      { id: 8, version: 1 },
    )
    expect(api.post).toHaveBeenCalledWith(
      '/grenade-lineups/8/revisions/1/restore',
      { note: 'rollback' },
    )
  })

  it('proposes a lineup and lists proposals', async () => {
    api.post.mockResolvedValue({ data: { proposal: { id: 9 } } })
    api.get.mockResolvedValue({ data: { proposals: [{ id: 9 }] } })

    await expect(proposeGrenadeLineup(8, { team_id: 4 })).resolves.toEqual({
      id: 9,
    })
    await expect(
      fetchMyGrenadeProposals({ status: 'PENDING', team_id: '' }),
    ).resolves.toEqual([{ id: 9 }])
    expect(api.post).toHaveBeenCalledWith('/grenade-lineups/8/propose', {
      team_id: 4,
    })
    expect(api.get).toHaveBeenCalledWith('/grenade-lineups/proposals', {
      params: { status: 'PENDING' },
    })
  })

  it('loads a single proposal and team proposals', async () => {
    api.get
      .mockResolvedValueOnce({ data: { proposal: { id: 10 } } })
      .mockResolvedValueOnce({ data: { proposals: [{ id: 10 }] } })

    await expect(fetchGrenadeProposal(10)).resolves.toEqual({ id: 10 })
    await expect(fetchTeamGrenadeProposals(4, { status: '' })).resolves.toEqual([
      { id: 10 },
    ])
    expect(api.get).toHaveBeenNthCalledWith(1, '/grenade-lineups/proposals/10')
    expect(api.get).toHaveBeenNthCalledWith(2, '/teams/4/grenade-proposals', {
      params: {},
    })
  })

  it('approves, rejects and cancels proposals', async () => {
    api.post
      .mockResolvedValueOnce({ data: { proposal: { id: 11, status: 'APPROVED' } } })
      .mockResolvedValueOnce({ data: { proposal: { id: 11, status: 'REJECTED' } } })
      .mockResolvedValueOnce({ data: { proposal: { id: 11, status: 'CANCELLED' } } })

    await expect(approveGrenadeProposal(11, { note: 'ok' })).resolves.toEqual({
      proposal: { id: 11, status: 'APPROVED' },
    })
    await expect(rejectGrenadeProposal(11)).resolves.toEqual({
      id: 11,
      status: 'REJECTED',
    })
    await expect(cancelGrenadeProposal(11)).resolves.toEqual({
      id: 11,
      status: 'CANCELLED',
    })
    expect(api.post).toHaveBeenNthCalledWith(
      1,
      '/grenade-lineups/proposals/11/approve',
      { note: 'ok' },
    )
    expect(api.post).toHaveBeenNthCalledWith(
      2,
      '/grenade-lineups/proposals/11/reject',
      {},
    )
    expect(api.post).toHaveBeenNthCalledWith(
      3,
      '/grenade-lineups/proposals/11/cancel',
    )
  })

  it('manages favourites through the legacy endpoints', async () => {
    api.get.mockResolvedValue({ data: { favorites: [1, 2] } })
    api.put.mockResolvedValue({})
    api.delete.mockResolvedValue({})

    await expect(fetchGrenadeFavorites()).resolves.toEqual([1, 2])
    await setGrenadeFavorite(2, true)
    await setGrenadeFavorite(2, false)
    expect(api.get).toHaveBeenCalledWith('/lineups/favorites')
    expect(api.put).toHaveBeenCalledWith('/lineups/2/favorite')
    expect(api.delete).toHaveBeenCalledWith('/lineups/2/favorite')
  })

  it('propagates errors from proposal decisions', async () => {
    api.post.mockRejectedValue(new Error('409 already decided'))

    await expect(approveGrenadeProposal(11)).rejects.toThrow('409 already decided')
  })
})
