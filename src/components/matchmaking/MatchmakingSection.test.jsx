import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import MatchmakingSection from './MatchmakingSection.jsx'
import {
  authorizeMatchmaking,
  fetchMatchmakingStatus,
  revokeMatchmaking,
  syncMatchmaking,
  uploadMatchmakingDemo,
} from '../../services/matchmaking.js'

vi.mock('../../services/matchmaking.js', () => ({
  authorizeMatchmaking: vi.fn(),
  fetchMatchmakingMatch: vi.fn(),
  fetchMatchmakingMatches: vi.fn(),
  fetchMatchmakingStatus: vi.fn(),
  revokeMatchmaking: vi.fn(),
  syncMatchmaking: vi.fn(),
  uploadMatchmakingDemo: vi.fn(),
}))

const MESSAGE =
  'Este jugador todavía no habilitó la sincronización de sus partidas de matchmaking oficial.'

const PROCESSED_MATCH = {
  id: 11,
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
  processed: true,
  source: 'VERIFIED_DEMO',
  share_code: 'CSGO-ABCDE-ABCDE-ABCDE-ABCDE-ABCDE',
}

const PENDING_MATCH = {
  ...PROCESSED_MATCH,
  id: 12,
  played_at: '2026-10-21T18:00:00Z',
  result: 'UNKNOWN',
  team_score: null,
  opponent_score: null,
  rounds_played: 0,
  rounds_won: 0,
  rounds_lost: 0,
  kills: 0,
  deaths: 0,
  assists: 0,
  damage: 0,
  headshot_kills: 0,
  mvps: 0,
  clutches: 0,
  opening_kills: 0,
  opening_deaths: 0,
  kd: null,
  adr: null,
  hs_percentage: null,
  kast_percentage: null,
  status: 'AWAITING_DEMO',
  status_label: 'Falta la demo',
  has_stats: false,
  processed: false,
  source: 'PENDING',
  share_code: 'CSGO-ABCDE-ABCDE-ABCDE-ABCDE-*****',
}

const SUMMARY = {
  has_data: true,
  matches_played: 1,
  wins: 1,
  losses: 0,
  draws: 0,
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
  win_rate: 100,
  source: 'VERIFIED_DEMO',
}

const NO_AUTH = {
  available: false,
  authorized: false,
  status: 'UNAVAILABLE',
  status_label: 'Sin autorizar',
  message: MESSAGE,
  unavailable_reason: MESSAGE,
  source: 'UNAVAILABLE',
  has_data: false,
  incomplete: false,
  incomplete_reason: null,
  summary: { ...SUMMARY, has_data: false, matches_played: 0 },
  map_performance: [],
  recent_matches: [],
  availability: { processed: 0, pending: 0, errors: 0, unavailable: 0, total: 0 },
  authorization: null,
  sync: {
    status: 'NEVER',
    status_label: 'Sin sincronizar',
    last_sync_at: null,
    can_sync: false,
    next_sync_at: null,
    api_configured: true,
  },
  enabled: true,
}

const ACTIVE = {
  available: true,
  authorized: true,
  status: 'PARTIAL',
  status_label: 'Historial incompleto',
  message: null,
  unavailable_reason: null,
  source: 'VERIFIED_DEMO',
  has_data: true,
  incomplete: true,
  incomplete_reason: '1 partida(s) todavía no tienen una demo procesada.',
  summary: SUMMARY,
  map_performance: [
    {
      map: 'de_mirage',
      matches_played: 1,
      wins: 1,
      losses: 0,
      win_rate: 100,
      kd: 2,
      adr: 80,
      hs_percentage: 40,
      kast_percentage: 70,
      source: 'VERIFIED_DEMO',
    },
  ],
  recent_matches: [PROCESSED_MATCH, PENDING_MATCH],
  availability: { processed: 1, pending: 1, errors: 0, unavailable: 0, total: 2 },
  authorization: {
    status: 'ACTIVE',
    authorized_at: '2026-10-01T10:00:00Z',
    revoked_at: null,
    steam_id: '76561198000000001',
    share_code: 'CSGO-ABCDE-*****-*****-*****-*****',
    last_discovery_at: '2026-10-20T12:00:00Z',
    last_discovery_status: 'OK',
    last_discovery_error: null,
  },
  sync: {
    status: 'OK',
    status_label: 'Sincronización correcta',
    last_sync_at: '2026-10-20T12:00:00Z',
    can_sync: true,
    next_sync_at: '2026-10-20T12:05:00Z',
    min_interval_seconds: 300,
    api_configured: true,
    last_sync_error: null,
  },
  enabled: true,
}

const REVOKED = {
  ...ACTIVE,
  authorized: false,
  status: 'REVOKED',
  status_label: 'Autorización revocada',
  unavailable_reason:
    'La autorización fue revocada. Las partidas procesadas siguen visibles, pero no se sincronizarán nuevas partidas.',
  authorization: {
    ...ACTIVE.authorization,
    status: 'REVOKED',
    revoked_at: '2026-10-25T10:00:00Z',
    share_code: null,
    last_discovery_error: null,
  },
  sync: { ...ACTIVE.sync, can_sync: false },
}

describe('MatchmakingSection', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('shows the exact message and the authorization form to the owner', () => {
    render(<MatchmakingSection matchmaking={NO_AUTH} owner />)

    expect(
      screen.getByRole('heading', { name: 'CS2 Matchmaking' }),
    ).toBeInTheDocument()
    expect(screen.getByText(MESSAGE)).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Habilitar sincronización' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Nunca pedimos tu contraseña/),
    ).toBeInTheDocument()
  })

  it('keeps the exact message for visitors but hides management controls', () => {
    render(<MatchmakingSection matchmaking={NO_AUTH} />)

    expect(screen.getByText(MESSAGE)).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Guardar autorización' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Sincronizar ahora' }),
    ).not.toBeInTheDocument()
  })

  it('renders weighted totals, maps, history and processing states', () => {
    render(<MatchmakingSection matchmaking={ACTIVE} owner />)

    expect(screen.getAllByText('Historial incompleto').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Demos oficiales').length).toBeGreaterThan(0)
    expect(screen.getAllByText('20 / 10 / 5').length).toBeGreaterThan(0)
    expect(screen.getAllByText('de_mirage').length).toBeGreaterThan(0)
    expect(screen.getByText('Victoria')).toBeInTheDocument()
    expect(screen.getByText('Falta la demo')).toBeInTheDocument()
    expect(screen.getByText('Pendiente de demo')).toBeInTheDocument()
    expect(
      screen.getByText(/1 partida\(s\) todavía no tienen una demo procesada/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Suma de numeradores y denominadores/),
    ).toBeInTheDocument()
  })

  it('queues a manual sync and reports the worker message', async () => {
    const onChange = vi.fn()
    syncMatchmaking.mockResolvedValue({
      status: 'QUEUED',
      sync: {
        status: 'RUNNING',
        message:
          'La sincronización quedó en cola; el worker la procesará en segundo plano.',
      },
      matchmaking: ACTIVE,
    })

    render(<MatchmakingSection matchmaking={ACTIVE} owner onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Sincronizar ahora' }))

    expect(
      await screen.findByText(/quedó en cola; el worker la procesará/),
    ).toBeInTheDocument()
    expect(syncMatchmaking).toHaveBeenCalledTimes(1)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('explains when the manual sync is skipped by the interval', async () => {
    syncMatchmaking.mockResolvedValue({
      status: 'SKIPPED',
      sync: { message: 'La sincronización se hizo recientemente.' },
      matchmaking: ACTIVE,
    })

    render(<MatchmakingSection matchmaking={ACTIVE} owner />)
    fireEvent.click(screen.getByRole('button', { name: 'Sincronizar ahora' }))

    expect(
      await screen.findByText('La sincronización se hizo recientemente.'),
    ).toBeInTheDocument()
  })

  it('authorizes with the Steam codes and replaces the form with the section', async () => {
    const onChange = vi.fn()
    authorizeMatchmaking.mockResolvedValue(ACTIVE)

    render(<MatchmakingSection matchmaking={NO_AUTH} owner onChange={onChange} />)

    fireEvent.change(
      screen.getByLabelText('Código de autenticación de Steam'),
      { target: { value: 'abcd-12345-efgh' } },
    )
    fireEvent.change(
      screen.getByLabelText('Share code de una partida reciente'),
      { target: { value: 'CSGO-ABCDE-ABCDE-ABCDE-ABCDE-ABCDE' } },
    )
    fireEvent.click(screen.getByRole('button', { name: 'Guardar autorización' }))

    await waitFor(() =>
      expect(authorizeMatchmaking).toHaveBeenCalledWith({
        authCode: 'abcd-12345-efgh',
        shareCode: 'CSGO-ABCDE-ABCDE-ABCDE-ABCDE-ABCDE',
      }),
    )
    expect(
      await screen.findByText(/Autorización guardada/),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Habilitar sincronización' }),
    ).not.toBeInTheDocument()
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('validates the authorization codes before calling the API', () => {
    render(<MatchmakingSection matchmaking={NO_AUTH} owner />)

    fireEvent.change(
      screen.getByLabelText('Código de autenticación de Steam'),
      { target: { value: 'bad' } },
    )
    fireEvent.click(screen.getByRole('button', { name: 'Guardar autorización' }))

    expect(
      screen.getByText(/Usá el formato XXXX-XXXXX-XXXX/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Pegá un share code de partida completo/),
    ).toBeInTheDocument()
    expect(authorizeMatchmaking).not.toHaveBeenCalled()
  })

  it('uploads a demo file for background processing', async () => {
    const onChange = vi.fn()
    uploadMatchmakingDemo.mockResolvedValue({ status: 'QUEUED' })

    render(<MatchmakingSection matchmaking={ACTIVE} owner onChange={onChange} />)
    const input = screen.getByLabelText('Demo de matchmaking')
    const file = new File(['demo'], 'match730_1.dem')

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() =>
      expect(uploadMatchmakingDemo).toHaveBeenCalledWith(file),
    )
    expect(
      await screen.findByText(/La demo se guardó/),
    ).toBeInTheDocument()
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('rejects non-demo files before uploading', () => {
    render(<MatchmakingSection matchmaking={ACTIVE} owner />)
    const input = screen.getByLabelText('Demo de matchmaking')
    const file = new File(['text'], 'notes.txt')

    fireEvent.change(input, { target: { files: [file] } })

    expect(
      screen.getByText('El archivo debe ser una demo .dem o .dem.bz2.'),
    ).toBeInTheDocument()
    expect(uploadMatchmakingDemo).not.toHaveBeenCalled()
  })

  it('refreshes the section on demand', async () => {
    fetchMatchmakingStatus.mockResolvedValue({
      ...ACTIVE,
      status: 'READY',
      status_label: 'Historial completo',
    })

    render(<MatchmakingSection matchmaking={ACTIVE} owner />)
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar estado' }))

    expect(await screen.findByText('Estado actualizado.')).toBeInTheDocument()
    expect(screen.getByText('Historial completo')).toBeInTheDocument()
  })

  it('revokes the authorization only after confirmation', async () => {
    const onChange = vi.fn()
    revokeMatchmaking.mockResolvedValue(REVOKED)

    render(<MatchmakingSection matchmaking={ACTIVE} owner onChange={onChange} />)
    fireEvent.click(
      screen.getByRole('button', { name: 'Revocar autorización' }),
    )

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText(/Las partidas ya procesadas se conservan/)).toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Revocar' }))

    await waitFor(() => expect(revokeMatchmaking).toHaveBeenCalledTimes(1))
    expect(
      screen.getByText(/La autorización fue revocada/),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Habilitar sincronización' }),
    ).toBeInTheDocument()
    expect(onChange).toHaveBeenCalledTimes(1)
  })
})
