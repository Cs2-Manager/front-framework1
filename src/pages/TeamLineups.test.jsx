import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import TeamLineups from './TeamLineups.jsx'

const mocks = vi.hoisted(() => ({
  useTeam: vi.fn(),
  useTeamLineups: vi.fn(),
  activateTeamLineup: vi.fn(),
  deactivateTeamLineup: vi.fn(),
  deleteTeamLineup: vi.fn(),
  setPrimaryTeamLineup: vi.fn(),
  createTeamLineup: vi.fn(),
  updateTeamLineup: vi.fn(),
}))

vi.mock('../hooks/useTeams.js', () => ({ useTeam: mocks.useTeam }))
vi.mock('../hooks/useTeamLineups.js', () => ({
  useTeamLineups: mocks.useTeamLineups,
}))
vi.mock('../services/teamLineups.js', () => ({
  activateTeamLineup: mocks.activateTeamLineup,
  deactivateTeamLineup: mocks.deactivateTeamLineup,
  deleteTeamLineup: mocks.deleteTeamLineup,
  setPrimaryTeamLineup: mocks.setPrimaryTeamLineup,
  createTeamLineup: mocks.createTeamLineup,
  updateTeamLineup: mocks.updateTeamLineup,
}))

function team(overrides = {}) {
  return {
    id: 5,
    name: 'Alpha Wolves',
    permissions: {
      can_view_lineups: true,
      can_manage_lineups: true,
      can_delete_lineups: true,
      can_set_primary_lineup: true,
    },
    ...overrides,
  }
}

function lineup(overrides = {}) {
  return {
    id: 11,
    name: 'Titular',
    description: 'La alineación principal',
    status: 'DRAFT',
    is_primary: false,
    starters_count: 4,
    substitutes_count: 1,
    is_complete: false,
    updated_at: '2026-02-01T00:00:00',
    permissions: {
      can_edit: true,
      can_manage_players: true,
      can_delete: true,
      can_activate: false,
      can_deactivate: false,
      can_set_primary: false,
    },
    ...overrides,
  }
}

function teamState(overrides = {}) {
  return {
    team: team(),
    loading: false,
    error: '',
    reload: vi.fn(),
    ...overrides,
  }
}

function lineupsState(overrides = {}) {
  return {
    lineups: [],
    limits: { starters: 5, substitutes: 5 },
    meta: { total: 0 },
    loading: false,
    error: '',
    reload: vi.fn(),
    ...overrides,
  }
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/teams/5/lineups']}>
      <Routes>
        <Route path="/teams/:id/lineups" element={<TeamLineups />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('TeamLineups page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mocks.useTeam.mockReturnValue(teamState())
    mocks.useTeamLineups.mockReturnValue(lineupsState())
  })

  it('shows loading and error states', () => {
    mocks.useTeamLineups.mockReturnValue(
      lineupsState({ loading: true }),
    )
    const { rerender } = renderPage()

    expect(screen.getByRole('status')).toHaveTextContent(
      'Cargando alineaciones…',
    )

    const reload = vi.fn()
    mocks.useTeam.mockReturnValue(teamState({ team: null, loading: false }))
    mocks.useTeamLineups.mockReturnValue(
      lineupsState({ error: 'Este equipo es privado.', reload }),
    )
    rerender(
      <MemoryRouter initialEntries={['/teams/5/lineups']}>
        <Routes>
          <Route path="/teams/:id/lineups" element={<TeamLineups />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Este equipo es privado.',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(reload).toHaveBeenCalled()
  })

  it('shows an empty state with the create action for managers', () => {
    renderPage()

    expect(
      screen.getByText('Este equipo todavía no tiene alineaciones.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Crear la primera alineación' }),
    ).toBeInTheDocument()
  })

  it('hides management actions from viewers without permission', () => {
    mocks.useTeam.mockReturnValue(
      teamState({
        team: team({
          permissions: {
            can_view_lineups: true,
            can_manage_lineups: false,
            can_delete_lineups: false,
            can_set_primary_lineup: false,
          },
        }),
      }),
    )
    mocks.useTeamLineups.mockReturnValue(
      lineupsState({
        lineups: [
          lineup({
            permissions: {
              can_edit: false,
              can_manage_players: false,
              can_delete: false,
              can_activate: false,
              can_deactivate: false,
              can_set_primary: false,
            },
          }),
        ],
      }),
    )

    renderPage()

    expect(
      screen.queryByRole('button', { name: 'Nueva alineación' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Eliminar' }),
    ).not.toBeInTheDocument()
  })

  it('renders lineup cards and available actions', () => {
    mocks.useTeamLineups.mockReturnValue(
      lineupsState({
        lineups: [
          lineup({
            permissions: {
              can_edit: true,
              can_manage_players: true,
              can_delete: true,
              can_activate: true,
              can_deactivate: false,
              can_set_primary: false,
            },
          }),
        ],
      }),
    )

    renderPage()

    expect(screen.getByText('Titular')).toBeInTheDocument()
    expect(screen.getByText('Borrador')).toBeInTheDocument()
    expect(screen.getByText('4/5 titulares')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Titular' }),
    ).toHaveAttribute('href', '/teams/5/lineups/11')
    expect(screen.getByRole('button', { name: 'Activar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Eliminar' })).toBeInTheDocument()
  })

  it('creates a lineup and navigates to its detail', async () => {
    mocks.createTeamLineup.mockResolvedValue({ id: 12, name: 'Nueva' })

    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Nueva alineación' }))
    fireEvent.change(screen.getByLabelText('Nombre'), {
      target: { value: ' Nueva ' },
    })
    fireEvent.change(screen.getByLabelText('Descripción (opcional)'), {
      target: { value: 'Notas' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Crear alineación' }))

    await waitFor(() =>
      expect(mocks.createTeamLineup).toHaveBeenCalledWith(5, {
        name: 'Nueva',
        description: 'Notas',
      }),
    )
  })

  it('activates and marks a lineup as primary', async () => {
    const reload = vi.fn()
    mocks.useTeamLineups.mockReturnValue(
      lineupsState({
        reload,
        lineups: [
          lineup({
            permissions: {
              can_edit: true,
              can_manage_players: true,
              can_delete: true,
              can_activate: true,
              can_deactivate: false,
              can_set_primary: true,
            },
          }),
        ],
      }),
    )
    mocks.activateTeamLineup.mockResolvedValue({})
    mocks.setPrimaryTeamLineup.mockResolvedValue({})

    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Activar' }))
    await waitFor(() =>
      expect(mocks.activateTeamLineup).toHaveBeenCalledWith(5, 11),
    )
    expect(screen.getByText('Alineación activada.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Hacer principal' }))
    await waitFor(() =>
      expect(mocks.setPrimaryTeamLineup).toHaveBeenCalledWith(5, 11),
    )
  })

  it('confirms deletion and reloads the collection', async () => {
    const reload = vi.fn()
    mocks.useTeamLineups.mockReturnValue(
      lineupsState({ reload, lineups: [lineup()] }),
    )
    mocks.deleteTeamLineup.mockResolvedValue()

    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))
    expect(
      screen.getByText(/¿Seguro que querés eliminar la alineación/),
    ).toBeInTheDocument()

    const buttons = screen.getAllByRole('button', { name: 'Eliminar' })
    fireEvent.click(buttons[buttons.length - 1])

    await waitFor(() =>
      expect(mocks.deleteTeamLineup).toHaveBeenCalledWith(5, 11),
    )
    expect(reload).toHaveBeenCalled()
    expect(screen.getByText('Alineación eliminada.')).toBeInTheDocument()
  })
})
