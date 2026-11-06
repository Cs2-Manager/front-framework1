import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  useOwnProfile,
  usePlayerProfile,
  usePlayers,
} from './useProfile.js'
import {
  fetchOwnProfile,
  fetchPlayer,
  fetchPlayers,
} from '../services/profiles.js'

vi.mock('../services/profiles.js', () => ({
  fetchOwnProfile: vi.fn(),
  fetchPlayer: vi.fn(),
  fetchPlayers: vi.fn(),
}))

describe('useProfile hooks', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('loads the own profile', async () => {
    fetchOwnProfile.mockResolvedValue({ id: 1, nickname: 'tester' })

    const { result } = renderHook(() => useOwnProfile())

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual({ id: 1, nickname: 'tester' })
    expect(result.current.error).toBe('')
  })

  it('reports a generic error when the own profile fails', async () => {
    fetchOwnProfile.mockRejectedValue(new Error('boom'))

    const { result } = renderHook(() => useOwnProfile())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe(
      'No pudimos cargar tu perfil. Intentalo de nuevo.',
    )
  })

  it('maps a private player profile to a clear message', async () => {
    fetchPlayer.mockRejectedValue({ response: { status: 403 } })

    const { result } = renderHook(() => usePlayerProfile(3))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Este perfil es privado.')
    expect(fetchPlayer).toHaveBeenCalledWith(3)
  })

  it('maps a missing player to a clear message', async () => {
    fetchPlayer.mockRejectedValue({ response: { status: 404 } })

    const { result } = renderHook(() => usePlayerProfile(99))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('No encontramos ese jugador.')
  })

  it('exposes the player directory and its metadata', async () => {
    fetchPlayers.mockResolvedValue({
      players: [{ id: 1 }],
      meta: { total: 1 },
    })

    const { result } = renderHook(() => usePlayers('frag'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(fetchPlayers).toHaveBeenCalledWith({ search: 'frag' })
    expect(result.current.players).toEqual([{ id: 1 }])
    expect(result.current.meta).toEqual({ total: 1 })
  })
})
