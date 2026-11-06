import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import PublicProfile from './PublicProfile.jsx'

const mocks = vi.hoisted(() => ({ usePlayerProfile: vi.fn() }))

vi.mock('../hooks/useProfile.js', () => ({
  usePlayerProfile: mocks.usePlayerProfile,
}))

const PROFILE = {
  id: 7,
  nickname: 'Frag',
  display_name: 'Frag Machine',
  country: 'AR',
  bio: null,
  avatar_url: null,
  steam_url: null,
  member_since: '2026-01-01T00:00:00',
  last_active_at: null,
  visibility: 'PUBLIC',
  is_owner: false,
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

function renderProfile() {
  return render(
    <MemoryRouter initialEntries={['/players/7']}>
      <Routes>
        <Route path="/players/:id" element={<PublicProfile />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('PublicProfile page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('shows a loading state while the player is requested', () => {
    mocks.usePlayerProfile.mockReturnValue({
      data: null,
      loading: true,
      error: '',
      reload: vi.fn(),
    })

    renderProfile()

    expect(
      screen.getByText('Cargando perfil del jugador…'),
    ).toBeInTheDocument()
    expect(mocks.usePlayerProfile).toHaveBeenCalledWith('7')
  })

  it('renders the public profile without private data', () => {
    mocks.usePlayerProfile.mockReturnValue({
      data: PROFILE,
      loading: false,
      error: '',
      reload: vi.fn(),
    })

    renderProfile()

    expect(
      screen.getByRole('heading', { name: 'Frag Machine' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Editar perfil')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Volver a jugadores/ })).toHaveAttribute(
      'href',
      '/players',
    )
  })

  it('shows the private profile error and offers a retry', () => {
    const reload = vi.fn()
    mocks.usePlayerProfile.mockReturnValue({
      data: null,
      loading: false,
      error: 'Este perfil es privado.',
      reload,
    })

    renderProfile()

    expect(screen.getByRole('alert')).toHaveTextContent('Este perfil es privado.')
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(reload).toHaveBeenCalledTimes(1)
  })
})
