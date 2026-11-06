import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import TeamLineupDetail from './TeamLineupDetail.jsx'

const mocks = vi.hoisted(() => ({
  useTeam: vi.fn(),
  useTeamLineup: vi.fn(),
  activateTeamLineup: vi.fn(),
  deactivateTeamLineup: vi.fn(),
  deleteTeamLineup: vi.fn(),
  replaceTeamLineupPlayers: vi.fn(),
  setPrimaryTeamLineup: vi.fn(),
  createTeamLineup: vi.fn(),
  updateTeamLineup: vi.fn(),
}))

vi.mock('../hooks/useTeams.js', () => ({ useTeam: mocks.useTeam }))
vi.mock('../hooks/useTeamLineups.js', () => ({
  useTeamLineup: mocks.useTeamLineup,
}))
vi.mock('../services/teamLineups.js', () => ({
  activateTeamLineup: mocks.activateTeamLineup,
  deactivateTeamLineup: mocks.deactivateTeamLineup,
  deleteTeamLineup: mocks.deleteTeamLineup,
  replaceTeamLineupPlayers: mocks.replaceTeamLineupPlayers,
  setPrimaryTeamLineup: mocks.setPrimaryTeamLineup,
  createTeamLineup: mocks.createTeamLineup,
  updateTeamLineup: mocks.updateTeamLineup,
}))

const PLAYERS = [
  { id: 1, username: 'cap' },
  { id: 2, username: 'awp' },
  { id: 3, username: 'entry' },
  { id: 4, username: 'support' },
  { id: 5, username: 'lurk' },
  { id: 6, username: 'bench' },
]

function member(user, role = 'PLAYER') {
  return {
    id: user.id,
    role,
    joined_at: '2026-01-03T00:00:00',
    user: {
      ...user,
      nickname: user.username,
      display_name: user.username,
    },
  }
}

function team(overrides = {}) {
  return {
    id: 5,
    name: 'Alpha Wolves',
    members: [
      member(PLAYERS[0], 'CAPTAIN'),
      ...PLAYERS.slice(1).map((player) => member(player)),
    ],
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
  const starterRoles = ['IGL', 'AWPER', 'ENTRY', 'SUPPORT', 'LURKER']
  return {
    id: 11,
    name: 'Titular',
    description: 'La alineación principal',
    status: 'DRAFT',
    is_primary: false,
    is_complete: true,
    starters_count: 5,
    substitutes_count: 1,
    updated_at: '2026-02-01T00:00:00',
    limits: { starters: 5, substitutes: 5 },
    starters: PLAYERS.slice(0, 5).map((player, index) => ({
      id: 100 + index,
      role: starterRoles[index],
      is_starter: true,
      user: player,
    })),
    substitutes: [
      { id: 200, role: 'FLEX', is_starter: false, user: PLAYERS[5] },
    ],
    permissions: {
      can_edit: true,
      can_manage_players: true,
      can_delete: true,
      can_activate: true,
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

function lineupState(overrides = {}) {
  return {
    lineup: lineup(),
    limits: { starters: 5, substitutes: 5 },
    loading: false,
    error: '',
    reload: vi.fn(),
    ...overrides,
  }
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/teams/5/lineups/11']}>
      <Routes>
        <Route
          path="/teams/:id/lineups/:lineupId"
          element={<TeamLineupDetail />}
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('TeamLineupDetail page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mocks.useTeam.mockReturnValue(teamState())
    mocks.useTeamLineup.mockReturnValue(lineupState())
  })

  it('shows loading and error states', () => {
    mocks.useTeamLineup.mockReturnValue(lineupState({ loading: true }))
    const { rerender } = renderPage()

    expect(screen.getByRole('status')).toHaveTextContent(
      'Cargando alineación…',
    )

    const reload = vi.fn()
    mocks.useTeamLineup.mockReturnValue(
      lineupState({ lineup: null, error: 'No encontramos esa alineación.', reload }),
    )
    rerender(
      <MemoryRouter initialEntries={['/teams/5/lineups/11']}>
        <Routes>
          <Route
            path="/teams/:id/lineups/:lineupId"
            element={<TeamLineupDetail />}
          />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'No encontramos esa alineación.',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(reload).toHaveBeenCalled()
  })

  it('renders the lineup, roster and manager actions', () => {
    renderPage()

    expect(
      screen.getByRole('heading', { name: 'Titular' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Borrador')).toBeInTheDocument()
    expect(screen.getByText('La alineación principal')).toBeInTheDocument()
    expect(screen.getByLabelText('Ubicación de cap')).toHaveValue('starter')
    expect(screen.getByLabelText('Rol de juego de cap')).toHaveValue('IGL')
    expect(screen.getByLabelText('Ubicación de bench')).toHaveValue(
      'substitute',
    )
    expect(screen.getByRole('button', { name: 'Editar datos' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Activar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Eliminar' })).toBeInTheDocument()
  })

  it('edits the lineup metadata', async () => {
    mocks.updateTeamLineup.mockResolvedValue({ id: 11 })
    const reload = vi.fn()
    mocks.useTeamLineup.mockReturnValue(lineupState({ reload }))

    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Editar datos' }))
    fireEvent.change(screen.getByLabelText('Nombre'), {
      target: { value: 'Roster B' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() =>
      expect(mocks.updateTeamLineup).toHaveBeenCalledWith(5, 11, {
        name: 'Roster B',
        description: 'La alineación principal',
      }),
    )
    expect(reload).toHaveBeenCalled()
  })

  it('saves the selected roster and game roles', async () => {
    const reload = vi.fn()
    mocks.replaceTeamLineupPlayers.mockResolvedValue({ id: 11 })
    mocks.useTeamLineup.mockReturnValue(lineupState({ reload }))

    renderPage()

    fireEvent.change(screen.getByLabelText('Ubicación de cap'), {
      target: { value: '' },
    })
    fireEvent.change(screen.getByLabelText('Ubicación de bench'), {
      target: { value: 'starter' },
    })
    fireEvent.change(screen.getByLabelText('Rol de juego de bench'), {
      target: { value: 'ANCHOR' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar alineación' }))

    await waitFor(() =>
      expect(mocks.replaceTeamLineupPlayers).toHaveBeenCalledWith(5, 11, {
        starters: [
          { user_id: 2, role: 'AWPER' },
          { user_id: 3, role: 'ENTRY' },
          { user_id: 4, role: 'SUPPORT' },
          { user_id: 5, role: 'LURKER' },
          { user_id: 6, role: 'ANCHOR' },
        ],
        substitutes: [],
      }),
    )
    expect(reload).toHaveBeenCalled()
    expect(screen.getByText('Alineación actualizada.')).toBeInTheDocument()
  })

  it('activates a complete draft lineup', async () => {
    const reload = vi.fn()
    mocks.activateTeamLineup.mockResolvedValue({})
    mocks.useTeamLineup.mockReturnValue(lineupState({ reload }))

    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Activar' }))

    await waitFor(() =>
      expect(mocks.activateTeamLineup).toHaveBeenCalledWith(5, 11),
    )
    expect(reload).toHaveBeenCalled()
    expect(screen.getByText('Alineación activada.')).toBeInTheDocument()
  })

  it('deactivates an active lineup and marks it as primary', async () => {
    const reload = vi.fn()
    mocks.deactivateTeamLineup.mockResolvedValue({})
    mocks.setPrimaryTeamLineup.mockResolvedValue({})
    mocks.useTeamLineup.mockReturnValue(
      lineupState({
        reload,
        lineup: lineup({
          status: 'ACTIVE',
          permissions: {
            can_edit: true,
            can_manage_players: true,
            can_delete: true,
            can_activate: false,
            can_deactivate: true,
            can_set_primary: true,
          },
        }),
      }),
    )

    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Desactivar' }))
    await waitFor(() =>
      expect(mocks.deactivateTeamLineup).toHaveBeenCalledWith(5, 11),
    )
    expect(screen.getByText('Alineación desactivada.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Hacer principal' }))
    await waitFor(() =>
      expect(mocks.setPrimaryTeamLineup).toHaveBeenCalledWith(5, 11),
    )
    expect(
      screen.getByText('Alineación marcada como principal.'),
    ).toBeInTheDocument()
  })

  it('confirms deletion', async () => {
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
  })

  it('renders a read-only roster for viewers without permission', () => {
    mocks.useTeamLineup.mockReturnValue(
      lineupState({
        lineup: lineup({
          permissions: {
            can_edit: false,
            can_manage_players: false,
            can_delete: false,
            can_activate: false,
            can_deactivate: false,
            can_set_primary: false,
          },
        }),
      }),
    )

    renderPage()

    expect(screen.getByLabelText('Ubicación de cap')).toBeDisabled()
    expect(screen.getByLabelText('Rol de juego de cap')).toBeDisabled()
    expect(
      screen.queryByRole('button', { name: 'Guardar alineación' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Editar datos' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Eliminar' }),
    ).not.toBeInTheDocument()
  })
})
