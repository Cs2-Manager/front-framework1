import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import Profile from './Profile.jsx'

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useOwnProfile: vi.fn(),
}))

vi.mock('../context/AuthContext.jsx', () => ({ useAuth: mocks.useAuth }))
vi.mock('../hooks/useProfile.js', () => ({
  useOwnProfile: mocks.useOwnProfile,
}))

const PROFILE = {
  id: 1,
  nickname: 'tester',
  display_name: 'Tester',
  country: 'AR',
  bio: null,
  avatar_url: null,
  steam_url: null,
  member_since: '2026-01-01T00:00:00',
  last_active_at: '2026-02-01T00:00:00',
  visibility: 'PRIVATE',
  email: 'tester@example.com',
  social_links: {},
  competitive: { status: 'UNRANKED', ranked: false, level: null, elo: null, xp: null },
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

function renderProfile(state, search = '') {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/profile', state, search }]}>
      <Profile />
    </MemoryRouter>,
  )
}

describe('Profile page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mocks.useAuth.mockReturnValue({ logout: vi.fn() })
  })

  it('shows a loading state while the profile is requested', () => {
    mocks.useOwnProfile.mockReturnValue({
      data: null,
      loading: true,
      error: '',
      reload: vi.fn(),
    })

    renderProfile()

    expect(screen.getByText('Cargando tu perfil…')).toBeInTheDocument()
  })

  it('renders the own profile', () => {
    mocks.useOwnProfile.mockReturnValue({
      data: PROFILE,
      loading: false,
      error: '',
      reload: vi.fn(),
    })

    renderProfile()

    expect(screen.getByRole('heading', { name: 'Tester' })).toBeInTheDocument()
    expect(screen.getByText('Perfil privado')).toBeInTheDocument()
    expect(screen.getByText('tester@example.com')).toBeInTheDocument()
  })

  it('shows the error state and retries the request', () => {
    const reload = vi.fn()
    mocks.useOwnProfile.mockReturnValue({
      data: null,
      loading: false,
      error: 'No pudimos cargar tu perfil.',
      reload,
    })

    renderProfile()

    expect(screen.getByRole('alert')).toHaveTextContent(
      'No pudimos cargar tu perfil.',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('shows a success notice after editing', () => {
    mocks.useOwnProfile.mockReturnValue({
      data: PROFILE,
      loading: false,
      error: '',
      reload: vi.fn(),
    })

    renderProfile({ updated: true })

    expect(
      screen.getByText('Perfil actualizado correctamente.'),
    ).toBeInTheDocument()
  })

  it('confirms a successful FACEIT Connect callback', () => {
    mocks.useOwnProfile.mockReturnValue({
      data: PROFILE,
      loading: false,
      error: '',
      reload: vi.fn(),
    })

    renderProfile(undefined, '?faceit=linked')

    expect(
      screen.getByText(/cuenta de FACEIT verificada correctamente/i),
    ).toBeInTheDocument()
  })

  it('explains an expired or reused FACEIT callback state', () => {
    mocks.useOwnProfile.mockReturnValue({
      data: PROFILE,
      loading: false,
      error: '',
      reload: vi.fn(),
    })

    renderProfile(undefined, '?faceit=error&reason=invalid_state')

    expect(
      screen.getByText(/venció o ya fue utilizada/i),
    ).toBeInTheDocument()
  })
})
