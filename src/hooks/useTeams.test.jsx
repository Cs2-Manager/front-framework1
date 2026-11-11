import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  useMyInvitations,
  useMyTeam,
  useTeam,
  useTeamInvitations,
  useTeams,
} from './useTeams.js'
import {
  fetchMyInvitations,
  fetchMyTeam,
  fetchTeam,
  fetchTeamInvitations,
  fetchTeams,
} from '../services/teams.js'

vi.mock('../services/teams.js', () => ({
  fetchMyInvitations: vi.fn(),
  fetchMyTeam: vi.fn(),
  fetchTeam: vi.fn(),
  fetchTeamInvitations: vi.fn(),
  fetchTeams: vi.fn(),
}))

describe('useTeams hooks', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('loads the team directory with its meta', async () => {
    fetchTeams.mockResolvedValue({
      teams: [{ id: 1 }],
      meta: { total: 1 },
    })

    const { result } = renderHook(() => useTeams('alpha'))

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(fetchTeams).toHaveBeenCalledWith({ search: 'alpha' })
    expect(result.current.teams).toEqual([{ id: 1 }])
    expect(result.current.meta).toEqual({ total: 1 })
  })

  it('falls back to an empty directory when the payload is missing', async () => {
    fetchTeams.mockResolvedValue(null)

    const { result } = renderHook(() => useTeams())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.teams).toEqual([])
    expect(result.current.meta).toBeNull()
  })

  it('maps private and missing teams to friendly messages', async () => {
    fetchTeam.mockRejectedValue({ response: { status: 403 } })

    const privateResult = renderHook(() => useTeam(1))
    await waitFor(() => expect(privateResult.result.current.loading).toBe(false))
    expect(privateResult.result.current.error).toBe('Este equipo es privado.')

    fetchTeam.mockRejectedValue({ response: { status: 404 } })
    const missingResult = renderHook(() => useTeam(2))
    await waitFor(() => expect(missingResult.result.current.loading).toBe(false))
    expect(missingResult.result.current.error).toBe(
      'No encontramos ese equipo.',
    )
  })

  it('falls back to the generic message for other failures', async () => {
    fetchTeam.mockRejectedValue(new Error('boom'))

    const { result } = renderHook(() => useTeam(3))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe(
      'No pudimos cargar el equipo. Intentalo de nuevo.',
    )
  })

  it('loads the current team and invitations', async () => {
    fetchMyTeam.mockResolvedValue({ id: 5 })
    fetchMyInvitations.mockResolvedValue({
      invitations: [{ id: 7 }],
      meta: { total: 1 },
    })
    fetchTeamInvitations.mockResolvedValue({
      invitations: [{ id: 8 }],
      meta: { total: 1 },
    })

    const team = renderHook(() => useMyTeam())
    await waitFor(() => expect(team.result.current.loading).toBe(false))
    expect(team.result.current.team).toEqual({ id: 5 })

    const mine = renderHook(() => useMyInvitations('ALL'))
    await waitFor(() => expect(mine.result.current.loading).toBe(false))
    expect(fetchMyInvitations).toHaveBeenCalledWith({ status: 'ALL' })
    expect(mine.result.current.invitations).toEqual([{ id: 7 }])

    const sent = renderHook(() => useTeamInvitations(5, 'PENDING'))
    await waitFor(() => expect(sent.result.current.loading).toBe(false))
    expect(fetchTeamInvitations).toHaveBeenCalledWith(5, { status: 'PENDING' })
    expect(sent.result.current.invitations).toEqual([{ id: 8 }])
  })
})
