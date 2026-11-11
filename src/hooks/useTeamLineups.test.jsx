import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useTeamLineup, useTeamLineups } from './useTeamLineups.js'
import {
  fetchTeamLineup,
  fetchTeamLineups,
} from '../services/teamLineups.js'

vi.mock('../services/teamLineups.js', () => ({
  fetchTeamLineup: vi.fn(),
  fetchTeamLineups: vi.fn(),
}))

describe('useTeamLineups hooks', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('loads the team lineups with limits and meta', async () => {
    fetchTeamLineups.mockResolvedValue({
      lineups: [{ id: 1 }],
      limits: { max: 5 },
      meta: { total: 1 },
    })

    const { result } = renderHook(() => useTeamLineups(4))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(fetchTeamLineups).toHaveBeenCalledWith(4)
    expect(result.current.lineups).toEqual([{ id: 1 }])
    expect(result.current.limits).toEqual({ max: 5 })
    expect(result.current.meta).toEqual({ total: 1 })
  })

  it('normalises a missing payload', async () => {
    fetchTeamLineups.mockResolvedValue(null)

    const { result } = renderHook(() => useTeamLineups(4))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.lineups).toEqual([])
    expect(result.current.limits).toBeNull()
  })

  it('maps private and missing lineups to friendly messages', async () => {
    fetchTeamLineups.mockRejectedValue({ response: { status: 403 } })

    const privateResult = renderHook(() => useTeamLineups(4))
    await waitFor(() =>
      expect(privateResult.result.current.loading).toBe(false),
    )
    expect(privateResult.result.current.error).toBe('Este equipo es privado.')

    fetchTeamLineups.mockRejectedValue({ response: { status: 404 } })
    const missingResult = renderHook(() => useTeamLineups(4))
    await waitFor(() =>
      expect(missingResult.result.current.loading).toBe(false),
    )
    expect(missingResult.result.current.error).toBe(
      'No encontramos esa alineación.',
    )
  })

  it('loads a single lineup', async () => {
    fetchTeamLineup.mockResolvedValue({
      lineup: { id: 2 },
      limits: { max: 3 },
    })

    const { result } = renderHook(() => useTeamLineup(4, 2))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(fetchTeamLineup).toHaveBeenCalledWith(4, 2)
    expect(result.current.lineup).toEqual({ id: 2 })
    expect(result.current.limits).toEqual({ max: 3 })
  })

  it('reports a generic error for unexpected failures', async () => {
    fetchTeamLineup.mockRejectedValue(new Error('boom'))

    const { result } = renderHook(() => useTeamLineup(4, 2))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe(
      'No pudimos cargar la alineación. Intentalo de nuevo.',
    )
  })
})
