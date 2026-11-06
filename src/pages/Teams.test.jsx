import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import Teams from './Teams.jsx'

const mocks = vi.hoisted(() => ({
  useTeams: vi.fn(),
  useAuth: vi.fn(),
}))

vi.mock('../hooks/useTeams.js', () => ({ useTeams: mocks.useTeams }))
vi.mock('../context/AuthContext.jsx', () => ({ useAuth: mocks.useAuth }))

const TEAM = {
  id: 5,
  name: 'Alpha Wolves',
  tag: 'AW',
  logo_url: null,
  country: 'AR',
  visibility: 'PUBLIC',
  created_at: '2026-01-02T00:00:00',
  member_count: 3,
  captain: { id: 1, username: 'cap', nickname: 'Captain' },
}

function state(overrides = {}) {
  return {
    teams: [],
    meta: { total: 0 },
    loading: false,
    error: '',
    reload: vi.fn(),
    ...overrides,
  }
}

function renderTeams() {
  return render(
    <MemoryRouter>
      <Teams />
    </MemoryRouter>,
  )
}

describe('Teams page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mocks.useAuth.mockReturnValue({ isAuthenticated: false })
  })

  it('shows a loading state', () => {
    mocks.useTeams.mockReturnValue(state({ loading: true }))

    renderTeams()

    expect(screen.getByRole('status')).toHaveTextContent('Cargando equipos…')
    expect(mocks.useTeams).toHaveBeenCalledWith('')
  })

  it('renders public team cards', () => {
    mocks.useTeams.mockReturnValue(
      state({ teams: [TEAM], meta: { total: 1 } }),
    )

    renderTeams()

    expect(screen.getByText('1 equipo')).toBeInTheDocument()
    expect(screen.getByText('Alpha Wolves')).toBeInTheDocument()
    expect(screen.getByText('[AW]')).toBeInTheDocument()
    expect(screen.getByText('3 integrantes')).toBeInTheDocument()
    expect(screen.getByText('Capitán: Captain')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Alpha Wolves/ }),
    ).toHaveAttribute('href', '/teams/5')
  })

  it('shows the create action only when authenticated', () => {
    mocks.useTeams.mockReturnValue(state())
    const { rerender } = renderTeams()

    expect(
      screen.queryByRole('link', { name: 'Crear equipo' }),
    ).not.toBeInTheDocument()

    mocks.useAuth.mockReturnValue({ isAuthenticated: true })
    rerender(
      <MemoryRouter>
        <Teams />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('link', { name: 'Crear equipo' }),
    ).toHaveAttribute('href', '/teams/new')
  })

  it('searches and clears the term', () => {
    mocks.useTeams.mockReturnValue(state())

    renderTeams()

    fireEvent.change(screen.getByLabelText('Buscar equipo'), {
      target: { value: ' alpha ' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Buscar/ }))

    expect(mocks.useTeams).toHaveBeenLastCalledWith('alpha')

    fireEvent.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }))
    expect(mocks.useTeams).toHaveBeenLastCalledWith('')
  })

  it('shows empty and error states', () => {
    mocks.useTeams.mockReturnValue(state())
    const { rerender } = renderTeams()

    expect(
      screen.getByText('Todavía no hay equipos públicos.'),
    ).toBeInTheDocument()

    const reload = vi.fn()
    mocks.useTeams.mockReturnValue(state({ error: 'Falló.', reload }))
    rerender(
      <MemoryRouter>
        <Teams />
      </MemoryRouter>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Falló.')
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(reload).toHaveBeenCalledTimes(1)
  })
})
