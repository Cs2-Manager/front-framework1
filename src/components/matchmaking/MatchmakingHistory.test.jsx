import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import MatchmakingHistory from './MatchmakingHistory.jsx'
import {
  fetchMatchmakingMatch,
  fetchMatchmakingMatches,
} from '../../services/matchmaking.js'

vi.mock('../../services/matchmaking.js', () => ({
  fetchMatchmakingMatch: vi.fn(),
  fetchMatchmakingMatches: vi.fn(),
}))

const PROCESSED = {
  id: 1,
  played_at: '2026-10-20T18:00:00Z',
  map: 'de_mirage',
  result: 'WIN',
  team_score: 13,
  opponent_score: 7,
  rounds_played: 20,
  rounds_won: 13,
  rounds_lost: 7,
  kills: 20,
  deaths: 10,
  assists: 5,
  damage: 1600,
  headshot_kills: 8,
  mvps: 4,
  clutches: 1,
  opening_kills: 3,
  opening_deaths: 2,
  kd: 2,
  adr: 80,
  hs_percentage: 40,
  kast_percentage: 70,
  status: 'OK',
  status_label: 'Procesada',
  has_stats: true,
  source: 'VERIFIED_DEMO',
  processed_at: '2026-10-20T18:10:00Z',
  share_code: 'CSGO-ABCDE-ABCDE-ABCDE-ABCDE-ABCDE',
}

const PENDING = {
  ...PROCESSED,
  id: 2,
  map: 'de_dust2',
  result: 'UNKNOWN',
  team_score: null,
  opponent_score: null,
  rounds_played: 0,
  kills: 0,
  deaths: 0,
  assists: 0,
  kd: null,
  adr: null,
  hs_percentage: null,
  kast_percentage: null,
  status: 'AWAITING_DEMO',
  status_label: 'Falta la demo',
  has_stats: false,
  source: 'PENDING',
  share_code: 'CSGO-ABCDE-*****-*****-*****-*****',
}

describe('MatchmakingHistory', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('lists processed and pending matches without inventing statistics', () => {
    render(<MatchmakingHistory matches={[PROCESSED, PENDING]} owner />)

    expect(screen.getByRole('heading', { name: 'Historial de partidas' })).toBeInTheDocument()
    expect(screen.getByText('Victoria')).toBeInTheDocument()
    expect(screen.getByText('Falta la demo')).toBeInTheDocument()
    expect(screen.getByText('Pendiente de demo')).toBeInTheDocument()
    expect(screen.getByText('20 / 10 / 5')).toBeInTheDocument()
  })

  it('shows an empty state when there are no matches', () => {
    render(<MatchmakingHistory matches={[]} />)

    expect(
      screen.getByText('Todavía no hay partidas de matchmaking registradas.'),
    ).toBeInTheDocument()
  })

  it('shows only the privacy-safe detail to visitors', () => {
    render(<MatchmakingHistory matches={[PROCESSED]} />)

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Ver detalle de la partida en de_mirage',
      }),
    )

    const dialog = screen.getByRole('dialog', { name: /Partida · de_mirage/ })
    expect(within(dialog).getByText('20 / 10 / 5')).toBeInTheDocument()
    expect(screen.queryByText(/CSGO-ABCDE-ABCDE/)).not.toBeInTheDocument()
    expect(fetchMatchmakingMatch).not.toHaveBeenCalled()
    expect(
      screen.queryByRole('button', { name: /historial completo/i }),
    ).not.toBeInTheDocument()
  })

  it('lets the owner load the full history and fetch match details', async () => {
    fetchMatchmakingMatches.mockResolvedValue({
      matches: [PROCESSED, PENDING],
      count: 2,
    })
    fetchMatchmakingMatch.mockResolvedValue({
      match: {
        ...PROCESSED,
        processing_error: 'Demo corrupta o ilegible',
        attempts: 2,
      },
    })

    render(<MatchmakingHistory matches={[PROCESSED]} owner />)
    fireEvent.click(
      screen.getByRole('button', { name: 'Ver historial completo' }),
    )

    await waitFor(() =>
      expect(fetchMatchmakingMatches).toHaveBeenCalledWith({ limit: 100 }),
    )
    expect(
      await screen.findByRole('button', { name: 'Actualizar historial' }),
    ).toBeInTheDocument()
    expect(screen.getByText('de_dust2')).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Ver detalle de la partida en de_mirage',
      }),
    )

    await waitFor(() =>
      expect(fetchMatchmakingMatch).toHaveBeenCalledWith(PROCESSED.id),
    )
    expect(
      await screen.findByText('CSGO-ABCDE-ABCDE-ABCDE-ABCDE-ABCDE'),
    ).toBeInTheDocument()
    expect(screen.getByText('Demo corrupta o ilegible')).toBeInTheDocument()
    expect(screen.getByText(/2 intento\(s\)/)).toBeInTheDocument()
  })

  it('reports detail errors without hiding the summary', async () => {
    fetchMatchmakingMatch.mockRejectedValue({
      response: { data: { error: 'Partida no encontrada' } },
    })

    render(<MatchmakingHistory matches={[PROCESSED]} owner />)
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Ver detalle de la partida en de_mirage',
      }),
    )

    expect(await screen.findByText('Partida no encontrada')).toBeInTheDocument()
  })
})
