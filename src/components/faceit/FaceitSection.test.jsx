import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import FaceitSection from './FaceitSection.jsx'
import {
  discoverFaceit,
  linkFaceit,
  startFaceitOauth,
  syncFaceit,
  unlinkFaceit,
} from '../../services/faceit.js'

vi.mock('../../services/faceit.js', () => ({
  discoverFaceit: vi.fn(),
  linkFaceit: vi.fn(),
  startFaceitOauth: vi.fn(),
  syncFaceit: vi.fn(),
  unlinkFaceit: vi.fn(),
}))

const ACCOUNT = {
  player_id: 'faceit-player-1',
  nickname: 'FaceitUser',
  avatar_url: null,
  country: 'ar',
  region: 'SA',
  steam_id: '76561198000000001',
  faceit_url: 'https://www.faceit.com/en/players/faceit-player-1',
  skill_level: 9,
  elo: 2100,
  link_status: 'VERIFIED',
  verified: true,
  verification_source: 'OAUTH2',
}

const STATS = {
  available: true,
  source: 'VERIFIED_FACEIT',
  matches_played: 120,
  wins: 70,
  losses: 50,
  win_rate: 58,
  kills: 2400,
  deaths: 1800,
  assists: 500,
  kd: 1.33,
  kr: 0.79,
  adr: 82.4,
  headshots: 1100,
  headshot_percentage: 46,
  mvps: 220,
  rounds_played: 2700,
  fetched_at: '2026-10-01T10:00:00Z',
}

const MATCH = {
  match_id: '1-abc',
  played_at: '2026-10-01T10:00:00Z',
  map: 'de_mirage',
  result: 'WIN',
  score: '13 / 7',
  faceit_url: 'https://www.faceit.com/en/cs2/room/1-abc',
  stats: { kd: 1.57, adr: 91.2, headshot_percentage: 52 },
}

const FACEIT = {
  linked: true,
  configured: true,
  oauth_configured: true,
  account: ACCOUNT,
  stats: STATS,
  recent_matches: [MATCH],
  map_stats: [
    {
      map: 'de_mirage',
      matches_played: 40,
      wins: 25,
      losses: 15,
      win_rate: 62.5,
      kd: 1.37,
      adr: 85.1,
      headshot_percentage: 48,
    },
  ],
  elo_history: [
    { elo: 2100, skill_level: 9, captured_at: '2026-10-01T10:00:00Z' },
  ],
  sync: {
    status: 'OK',
    last_sync_at: '2026-10-01T10:00:00Z',
    next_sync_at: null,
    can_sync: true,
    oauth_configured: true,
  },
}

describe('FaceitSection', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('is hidden from visitors when the player has no FACEIT account', () => {
    const { container } = render(
      <FaceitSection faceit={{ ...FACEIT, linked: false, account: null }} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders verified identity, stats and history without mixing sources', () => {
    render(<FaceitSection faceit={FACEIT} owner />)

    expect(screen.getAllByText('FaceitUser').length).toBeGreaterThan(0)
    expect(screen.getByText('76561198000000001')).toBeInTheDocument()
    expect(
      screen.getByText('Verificada con FACEIT Connect'),
    ).toBeInTheDocument()
    expect(screen.getAllByText('Verificado en FACEIT').length).toBeGreaterThan(
      0,
    )
    expect(screen.getByText('120')).toBeInTheDocument()
    expect(screen.getByText('1.33')).toBeInTheDocument()
    expect(screen.getAllByText('de_mirage').length).toBeGreaterThan(0)
    expect(screen.getByText(/ELO actual/)).toBeInTheDocument()
    expect(screen.getAllByText('2100').length).toBeGreaterThan(0)
  })

  it('never invents stats when FACEIT did not return any', () => {
    render(
      <FaceitSection
        faceit={{
          ...FACEIT,
          stats: { ...STATS, available: false, source: 'UNAVAILABLE' },
        }}
        owner
      />,
    )

    expect(
      screen.getByText(/todavía no entregó estadísticas/i),
    ).toBeInTheDocument()
    expect(screen.queryByText('0.00')).not.toBeInTheDocument()
  })

  it('synchronizes and reports the result', async () => {
    const onChange = vi.fn()
    syncFaceit.mockResolvedValue({
      status: 'OK',
      message: 'Estadísticas de FACEIT actualizadas.',
    })

    render(<FaceitSection faceit={FACEIT} owner onChange={onChange} />)
    fireEvent.click(
      screen.getByRole('button', { name: 'Sincronizar FACEIT' }),
    )

    expect(
      await screen.findByText('Estadísticas de FACEIT actualizadas.'),
    ).toBeInTheDocument()
    expect(syncFaceit).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('keeps synchronization disabled while the interval is active', () => {
    render(
      <FaceitSection
        faceit={{ ...FACEIT, sync: { ...FACEIT.sync, can_sync: false } }}
        owner
      />,
    )

    expect(
      screen.getByRole('button', { name: 'Sincronizar FACEIT' }),
    ).toBeDisabled()
  })

  it('unlinks only after confirmation', async () => {
    const onChange = vi.fn()
    unlinkFaceit.mockResolvedValue({ linked: false })

    render(<FaceitSection faceit={FACEIT} owner onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Desvincular' }))

    const dialog = screen.getByRole('dialog')
    expect(
      within(dialog).getByText(/tu cuenta local no se elimina/i),
    ).toBeInTheDocument()
    expect(unlinkFaceit).not.toHaveBeenCalled()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Desvincular' }))
    await waitFor(() => expect(unlinkFaceit).toHaveBeenCalledTimes(1))
    expect(onChange).toHaveBeenCalledTimes(1)
  })
})

describe('FACEIT discovery', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('discovers an account from the verified SteamID and links it', async () => {
    const onChange = vi.fn()
    discoverFaceit.mockResolvedValue({
      found: true,
      linked: false,
      claimed: false,
      player: { ...ACCOUNT, link_status: 'DISCOVERED', verified: false },
    })
    linkFaceit.mockResolvedValue({ linked: true })

    render(
      <FaceitSection
        faceit={{ linked: false, configured: true, oauth_configured: true }}
        owner
        onChange={onChange}
      />,
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Descubrir desde Steam' }),
    )
    expect(await screen.findByText('FaceitUser')).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: 'Vincular esta cuenta' }),
    )
    await waitFor(() => expect(linkFaceit).toHaveBeenCalledTimes(1))
    expect(linkFaceit).toHaveBeenCalledWith('faceit-player-1')
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('explains when no FACEIT account matches the SteamID', async () => {
    discoverFaceit.mockResolvedValue({
      found: false,
      linked: false,
      claimed: false,
      player: null,
      message: 'No encontramos una cuenta FACEIT asociada a tu SteamID.',
    })

    render(
      <FaceitSection
        faceit={{ linked: false, configured: true, oauth_configured: false }}
        owner
      />,
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Descubrir desde Steam' }),
    )
    expect(
      await screen.findByText(
        'No encontramos una cuenta FACEIT asociada a tu SteamID.',
      ),
    ).toBeInTheDocument()
  })

  it('starts the FACEIT Connect flow with the backend authorization URL', async () => {
    startFaceitOauth.mockResolvedValue('https://accounts.faceit.test/oauth')
    const assign = vi.fn()
    vi.stubGlobal('location', { ...window.location, assign })

    render(
      <FaceitSection
        faceit={{ linked: false, configured: true, oauth_configured: true }}
        owner
      />,
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Verificar con FACEIT Connect' }),
    )
    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith('https://accounts.faceit.test/oauth'),
    )
    vi.unstubAllGlobals()
  })
})
