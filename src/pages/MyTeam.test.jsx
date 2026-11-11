import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import MyTeam from './MyTeam.jsx'

const mocks = vi.hoisted(() => ({ useMyTeam: vi.fn() }))

vi.mock('../hooks/useTeams.js', () => ({ useMyTeam: mocks.useMyTeam }))

function state(overrides = {}) {
  return {
    team: null,
    loading: false,
    error: '',
    reload: vi.fn(),
    ...overrides,
  }
}

function renderPage() {
  return render(
    <MemoryRouter>
      <MyTeam />
    </MemoryRouter>,
  )
}

describe('MyTeam page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('shows a loading state', () => {
    mocks.useMyTeam.mockReturnValue(state({ loading: true }))

    renderPage()

    expect(screen.getByRole('status')).toHaveTextContent('Cargando tu equipo')
  })

  it('shows the empty state with both calls to action', () => {
    mocks.useMyTeam.mockReturnValue(state())

    renderPage()

    expect(screen.getByText('Todavía no tenés un equipo')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Crear equipo' })).toHaveAttribute(
      'href',
      '/teams/new',
    )
    expect(
      screen.getByRole('link', { name: 'Explorar equipos' }),
    ).toHaveAttribute('href', '/teams')
  })

  it('renders the active team with its permissions', () => {
    mocks.useMyTeam.mockReturnValue(
      state({
        team: {
          id: 5,
          name: 'Alpha Wolves',
          tag: 'AW',
          country: 'AR',
          member_count: 3,
          visibility: 'PUBLIC',
          my_role: 'CAPTAIN',
          description: 'Equipo de prueba',
          permissions: { can_view_lineups: true, can_edit: true },
        },
      }),
    )

    renderPage()

    expect(
      screen.getByRole('heading', { name: 'Alpha Wolves' }),
    ).toBeInTheDocument()
    expect(screen.getByText('3 integrantes')).toBeInTheDocument()
    expect(screen.getByText('Equipo público')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Alineaciones' })).toHaveAttribute(
      'href',
      '/teams/5/lineups',
    )
    expect(screen.getByRole('link', { name: 'Editar equipo' })).toHaveAttribute(
      'href',
      '/teams/5/edit',
    )
  })

  it('hides restricted actions for a member without permissions', () => {
    mocks.useMyTeam.mockReturnValue(
      state({
        team: {
          id: 6,
          name: 'Beta',
          member_count: 1,
          visibility: 'PRIVATE',
          permissions: { can_view_lineups: false, can_edit: false },
        },
      }),
    )

    renderPage()

    expect(screen.getByText('1 integrante')).toBeInTheDocument()
    expect(screen.getByText('Equipo privado')).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Alineaciones' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Editar equipo' }),
    ).not.toBeInTheDocument()
  })

  it('shows the error state with a retry action', () => {
    const reload = vi.fn()
    mocks.useMyTeam.mockReturnValue(
      state({ error: 'No pudimos cargar tu equipo.', reload }),
    )

    renderPage()

    expect(
      screen.getByText('No pudimos cargar tu equipo.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument()
  })
})
