import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import ProfileView from './ProfileView.jsx'

const BASE_PROFILE = {
  id: 1,
  nickname: 'Frag',
  display_name: 'Frag Machine',
  country: 'AR',
  bio: 'Jugador competitivo',
  avatar_url: null,
  steam_url: 'https://steamcommunity.com/id/frag',
  member_since: '2026-01-02T00:00:00',
  last_active_at: '2026-02-03T10:30:00',
  visibility: 'PUBLIC',
  email: 'frag@example.com',
  social_links: { twitch: 'https://twitch.tv/frag' },
  competitive: {
    status: 'UNRANKED',
    ranked: false,
    level: null,
    elo: null,
    xp: null,
  },
  stats: {
    has_data: false,
    matches_played: 0,
    wins: 0,
    losses: 0,
    kd: null,
    kr: null,
    adr: null,
    headshot_percentage: null,
    win_rate: null,
  },
  recent_matches: [],
  map_performance: [],
}

const POPULATED_PROFILE = {
  ...BASE_PROFILE,
  is_owner: true,
  competitive: {
    status: 'RANKED',
    ranked: true,
    level: 7,
    elo: 1850,
    xp: 4200,
  },
  stats: {
    has_data: true,
    matches_played: 4,
    wins: 3,
    losses: 1,
    kills: 30,
    deaths: 20,
    assists: 5,
    kd: 1.5,
    kr: 0.8,
    adr: 85.4,
    headshot_percentage: 50,
    win_rate: 75,
  },
  recent_matches: [
    {
      id: 11,
      played_at: '2026-02-01T18:00:00',
      map: { id: 1, name: 'Mirage' },
      result: 'WIN',
      match_type: 'COMPETITIVE',
      kills: 20,
      deaths: 10,
      assists: 5,
      adr: 90,
      headshot_percentage: 40,
    },
  ],
  map_performance: [
    {
      map: { id: 1, name: 'Mirage' },
      matches_played: 4,
      wins: 3,
      losses: 1,
      win_rate: 75,
      kd: 1.5,
      adr: 85.4,
    },
  ],
}

function renderProfile(profile, props = {}) {
  return render(
    <MemoryRouter>
      <ProfileView profile={profile} {...props} />
    </MemoryRouter>,
  )
}

describe('ProfileView', () => {
  it('renders the identity and clear empty states without inventing data', () => {
    renderProfile(BASE_PROFILE)

    expect(
      screen.getByRole('heading', { name: 'Frag Machine' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('@Frag', { selector: '.player-nickname' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Sin clasificar')).toBeInTheDocument()
    expect(
      screen.getByText(/Todavía no hay datos competitivos verificados/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Todavía no hay estadísticas de CS2 registradas/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Todavía no hay partidas registradas/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Todavía no hay rendimiento por mapa/),
    ).toBeInTheDocument()
  })

  it('renders competitive data, stats, history and map performance', () => {
    renderProfile(POPULATED_PROFILE)

    expect(screen.getByText('Clasificado')).toBeInTheDocument()
    expect(screen.getByText('1850')).toBeInTheDocument()
    expect(screen.getByText('1.50', { selector: '.stat-value' })).toBeInTheDocument()
    expect(screen.getByText('75.0%', { selector: '.stat-value' })).toBeInTheDocument()
    expect(screen.getAllByText('Mirage', { selector: 'td' })).toHaveLength(2)
    expect(screen.getByText('Victoria')).toBeInTheDocument()
    expect(screen.getByText('Competitivo')).toBeInTheDocument()
    expect(screen.getByText('Kills')).toBeInTheDocument()
    expect(screen.getByText('Deaths')).toBeInTheDocument()
    expect(screen.getByText('Assists')).toBeInTheDocument()
    expect(screen.queryByText('Ranking')).not.toBeInTheDocument()
  })

  it('shows ranking and XP progress only when the backend provides them', () => {
    renderProfile({
      ...BASE_PROFILE,
      competitive: {
        ...BASE_PROFILE.competitive,
        ranking_position: 12,
        xp_to_next_level: 300,
      },
    })

    expect(screen.getByText('Ranking')).toBeInTheDocument()
    expect(screen.getByText('#12')).toBeInTheDocument()
    expect(screen.getByText('XP para subir')).toBeInTheDocument()
    expect(screen.getByText('300')).toBeInTheDocument()
  })

  it('shows the owner-only actions and private fields', () => {
    renderProfile(POPULATED_PROFILE, { owner: true })

    expect(screen.getByRole('link', { name: /Editar perfil/ })).toHaveAttribute(
      'href',
      '/profile/edit',
    )
    expect(screen.getByText('frag@example.com')).toBeInTheDocument()
    expect(screen.getByText('Perfil público')).toBeInTheDocument()
  })

  it('hides owner actions and email from visitors', () => {
    renderProfile(BASE_PROFILE)

    expect(
      screen.queryByRole('link', { name: /Editar perfil/ }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('frag@example.com')).not.toBeInTheDocument()
  })

  it('renders the independent CS2 matchmaking card', () => {
    renderProfile({
      ...BASE_PROFILE,
      matchmaking: {
        available: false,
        authorized: false,
        status: 'UNAVAILABLE',
        status_label: 'Sin autorizar',
        message:
          'Este jugador todavía no habilitó la sincronización de sus partidas de matchmaking oficial.',
        unavailable_reason: null,
        has_data: false,
        incomplete: false,
        incomplete_reason: null,
        summary: { has_data: false },
        map_performance: [],
        recent_matches: [],
        authorization: null,
        sync: { status: 'NEVER', status_label: 'Sin sincronizar' },
        enabled: true,
      },
    })

    expect(
      screen.getByRole('heading', { name: 'CS2 Matchmaking' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Este jugador todavía no habilitó la sincronización de sus partidas de matchmaking oficial.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Sección independiente de FACEIT y de los datos de Steam/),
    ).toBeInTheDocument()
  })

  it('renders social links and the Steam link', () => {
    renderProfile(BASE_PROFILE)

    expect(
      screen.getByRole('link', { name: /Ver perfil de Steam/ }),
    ).toHaveAttribute('href', 'https://steamcommunity.com/id/frag')
    expect(screen.getByRole('link', { name: /Twitch/ })).toHaveAttribute(
      'href',
      'https://twitch.tv/frag',
    )
  })
})
