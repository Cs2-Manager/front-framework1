import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import AppRoutes from './index.jsx'

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useTeams: vi.fn(),
}))

vi.mock('../context/AuthContext.jsx', () => ({ useAuth: mocks.useAuth }))
vi.mock('../hooks/useTeams.js', () => ({ useTeams: mocks.useTeams }))

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

describe('AppRoutes', () => {
  beforeEach(() => {
    mocks.useAuth.mockReturnValue({
      isAuthenticated: false,
      initializing: false,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
    })
    mocks.useTeams.mockReturnValue({
      teams: [],
      meta: { total: 0 },
      loading: false,
      error: '',
      reload: vi.fn(),
    })
  })

  it('renders the layout and main navigation on the login route', () => {
    renderAt('/login')

    expect(
      screen.getAllByRole('link', { name: 'Equipos' }).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getAllByRole('link', { name: 'Equipos' })[0],
    ).toHaveAttribute('href', '/teams')
    expect(
      screen.getAllByRole('link', { name: 'Lineups' }).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getAllByRole('link', { name: 'Inicio' }).length,
    ).toBeGreaterThan(0)
  })

  it('renders the public teams route inside the layout', () => {
    renderAt('/teams')

    expect(
      screen.getByRole('heading', { name: 'Equipos' }),
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: 'Equipos' }).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getByText('Todavía no hay equipos públicos.'),
    ).toBeInTheDocument()
  })
})
