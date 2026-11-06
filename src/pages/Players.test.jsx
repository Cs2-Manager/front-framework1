import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import Players from './Players.jsx'

const mocks = vi.hoisted(() => ({ usePlayers: vi.fn() }))

vi.mock('../hooks/useProfile.js', () => ({ usePlayers: mocks.usePlayers }))

const PLAYER = {
  id: 3,
  nickname: 'Frag',
  display_name: 'Frag Machine',
  country: 'AR',
  avatar_url: null,
  competitive: { status: 'RANKED', elo: 1850 },
  stats: { has_data: true, matches_played: 4, win_rate: 75 },
}

function renderPlayers() {
  return render(
    <MemoryRouter>
      <Players />
    </MemoryRouter>,
  )
}

function state(overrides = {}) {
  return {
    players: [],
    meta: { total: 0 },
    loading: false,
    error: '',
    reload: vi.fn(),
    ...overrides,
  }
}

describe('Players page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('shows a loading state while the directory is requested', () => {
    mocks.usePlayers.mockReturnValue(state({ loading: true }))

    renderPlayers()

    expect(screen.getByRole('status')).toHaveTextContent('Cargando jugadores…')
    expect(mocks.usePlayers).toHaveBeenCalledWith('')
  })

  it('renders public player cards with their real data', () => {
    mocks.usePlayers.mockReturnValue(
      state({ players: [PLAYER], meta: { total: 1 } }),
    )

    renderPlayers()

    expect(screen.getByText('1 jugador')).toBeInTheDocument()
    expect(screen.getByText('Frag Machine')).toBeInTheDocument()
    expect(screen.getByText('1850 ELO')).toBeInTheDocument()
    expect(screen.getByText('75.0%')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Frag Machine/ })).toHaveAttribute(
      'href',
      '/players/3',
    )
  })

  it('shows the empty state when there are no public profiles', () => {
    mocks.usePlayers.mockReturnValue(state())

    renderPlayers()

    expect(
      screen.getByText('Todavía no hay jugadores con perfil público.'),
    ).toBeInTheDocument()
  })

  it('searches by term and can clear the search', () => {
    mocks.usePlayers.mockReturnValue(state())

    renderPlayers()

    fireEvent.change(screen.getByLabelText('Buscar jugador'), {
      target: { value: ' frag ' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Buscar/ }))

    expect(mocks.usePlayers).toHaveBeenLastCalledWith('frag')

    mocks.usePlayers.mockReturnValue(state())
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }))
    expect(mocks.usePlayers).toHaveBeenLastCalledWith('')
  })

  it('shows the error state and retries', () => {
    const reload = vi.fn()
    mocks.usePlayers.mockReturnValue(
      state({ error: 'No pudimos cargar el directorio.', reload }),
    )

    renderPlayers()

    expect(screen.getByRole('alert')).toHaveTextContent(
      'No pudimos cargar el directorio.',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(reload).toHaveBeenCalledTimes(1)
  })
})
