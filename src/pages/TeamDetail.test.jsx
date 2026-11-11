import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import TeamDetail from './TeamDetail.jsx'

const mocks = vi.hoisted(() => ({
  useTeam: vi.fn(),
  useAuth: vi.fn(),
  useRealtime: vi.fn(),
  fetchTeamActivity: vi.fn(),
  inviteTeamMember: vi.fn(),
  cancelTeamInvitation: vi.fn(),
  removeTeamMember: vi.fn(),
  updateTeamMemberRole: vi.fn(),
  transferTeamCaptain: vi.fn(),
  leaveTeam: vi.fn(),
}))

vi.mock('../hooks/useTeams.js', () => ({ useTeam: mocks.useTeam }))
vi.mock('../context/AuthContext.jsx', () => ({ useAuth: mocks.useAuth }))
// Se conserva `normalizeTeamActivity` real; solo se sustituye `useRealtime`.
vi.mock('../context/RealtimeContext.jsx', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRealtime: mocks.useRealtime,
  }
})
vi.mock('../services/teamActivity.js', () => ({
  fetchTeamActivity: mocks.fetchTeamActivity,
}))
vi.mock('../services/teams.js', () => ({
  inviteTeamMember: mocks.inviteTeamMember,
  cancelTeamInvitation: mocks.cancelTeamInvitation,
  removeTeamMember: mocks.removeTeamMember,
  updateTeamMemberRole: mocks.updateTeamMemberRole,
  transferTeamCaptain: mocks.transferTeamCaptain,
  leaveTeam: mocks.leaveTeam,
}))

function member(id, role, username) {
  return {
    id,
    role,
    joined_at: '2026-01-03T00:00:00',
    user: {
      id,
      username,
      nickname: username,
      display_name: username,
    },
  }
}

function team(overrides = {}) {
  return {
    id: 5,
    name: 'Alpha Wolves',
    tag: 'AW',
    logo_url: null,
    description: 'Equipo de prueba',
    country: 'AR',
    visibility: 'PUBLIC',
    created_at: '2026-01-02T00:00:00',
    member_count: 2,
    is_member: true,
    my_role: 'CAPTAIN',
    captain: member(1, 'CAPTAIN', 'cap').user,
    members: [member(1, 'CAPTAIN', 'cap'), member(2, 'PLAYER', 'frag')],
    permissions: {
      can_edit: true,
      can_manage_members: true,
      can_change_roles: true,
      can_manage_invitations: true,
      can_invite: true,
      can_transfer_captain: true,
      can_leave: true,
    },
    pending_invitations: [
      {
        id: 9,
        role: 'PLAYER',
        status: 'PENDING',
        created_at: '2026-01-04T00:00:00',
        responded_at: null,
        user: { id: 3, username: 'target', nickname: 'target' },
        invited_by: { id: 1, username: 'cap', nickname: 'cap' },
        team: { id: 5, name: 'Alpha Wolves', tag: 'AW' },
      },
    ],
    ...overrides,
  }
}

function state(overrides = {}) {
  return {
    team: team(),
    loading: false,
    error: '',
    reload: vi.fn(),
    ...overrides,
  }
}

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/teams/5']}>
      <TeamDetail />
    </MemoryRouter>,
  )
}

describe('TeamDetail page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mocks.useAuth.mockReturnValue({ user: { id: 1, username: 'cap' } })
    mocks.useRealtime.mockReturnValue({
      presenceByTeam: {},
      activityByTeam: {},
    })
    mocks.fetchTeamActivity.mockResolvedValue({
      activities: [],
      meta: { total: 0, page: 1, per_page: 20 },
    })
  })

  it('shows loading and error states', () => {
    mocks.useTeam.mockReturnValue(state({ team: null, loading: true }))
    const { rerender } = renderDetail()

    expect(screen.getByRole('status')).toHaveTextContent('Cargando equipo…')

    const reload = vi.fn()
    mocks.useTeam.mockReturnValue(
      state({ team: null, error: 'Este equipo es privado.', reload }),
    )
    rerender(
      <MemoryRouter initialEntries={['/teams/5']}>
        <TeamDetail />
      </MemoryRouter>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Este equipo es privado.')
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('renders the captain management actions', () => {
    mocks.useTeam.mockReturnValue(state())

    renderDetail()

    expect(screen.getByRole('heading', { name: 'Alpha Wolves' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Editar equipo' })).toHaveAttribute(
      'href',
      '/teams/5/edit',
    )
    expect(screen.getByText('Tu rol: Capitán')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre de usuario')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Hacer entrenador' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Transferir capitanía' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Expulsar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Abandonar equipo' }),
    ).toBeInTheDocument()
  })

  it('hides management actions from outsiders', () => {
    mocks.useAuth.mockReturnValue({ user: { id: 9, username: 'outsider' } })
    mocks.useTeam.mockReturnValue(
      state({
        team: team({
          is_member: false,
          my_role: null,
          permissions: {
            can_edit: false,
            can_manage_members: false,
            can_change_roles: false,
            can_manage_invitations: false,
            can_invite: false,
            can_transfer_captain: false,
            can_leave: false,
          },
          pending_invitations: undefined,
        }),
      }),
    )

    renderDetail()

    expect(
      screen.queryByRole('link', { name: 'Editar equipo' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByLabelText('Nombre de usuario'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Expulsar' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Abandonar equipo' }),
    ).not.toBeInTheDocument()
  })

  it('lets a coach invite and cancel only their own invitation', () => {
    mocks.useAuth.mockReturnValue({ user: { id: 2, username: 'coach' } })
    mocks.useTeam.mockReturnValue(
      state({
        team: team({
          my_role: 'COACH',
          member_count: 3,
          captain: member(1, 'CAPTAIN', 'cap').user,
          members: [
            member(1, 'CAPTAIN', 'cap'),
            member(2, 'COACH', 'coach'),
            member(3, 'PLAYER', 'frag'),
          ],
          permissions: {
            can_edit: false,
            can_manage_members: false,
            can_change_roles: false,
            can_manage_invitations: true,
            can_invite: true,
            can_transfer_captain: false,
            can_leave: true,
          },
          pending_invitations: [
            {
              id: 9,
              role: 'PLAYER',
              status: 'PENDING',
              created_at: '2026-01-04T00:00:00',
              responded_at: null,
              user: { id: 4, username: 'own-target' },
              invited_by: { id: 2, username: 'coach' },
              team: { id: 5, name: 'Alpha Wolves' },
            },
            {
              id: 10,
              role: 'PLAYER',
              status: 'PENDING',
              created_at: '2026-01-04T00:00:00',
              responded_at: null,
              user: { id: 5, username: 'other-target' },
              invited_by: { id: 1, username: 'cap' },
              team: { id: 5, name: 'Alpha Wolves' },
            },
          ],
        }),
      }),
    )

    renderDetail()

    expect(screen.getByLabelText('Nombre de usuario')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Editar equipo' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Cancelar' })).toHaveLength(1)
  })

  it('sends an invitation with the selected role', async () => {
    const reload = vi.fn()
    mocks.inviteTeamMember.mockResolvedValue({ id: 11 })
    mocks.useTeam.mockReturnValue(state({ reload }))

    renderDetail()

    fireEvent.change(screen.getByLabelText('Nombre de usuario'), {
      target: { value: ' frag ' },
    })
    fireEvent.change(screen.getByLabelText('Rol'), {
      target: { value: 'COACH' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Invitar' }))

    await waitFor(() =>
      expect(mocks.inviteTeamMember).toHaveBeenCalledWith(5, {
        username: 'frag',
        role: 'COACH',
      }),
    )
    expect(reload).toHaveBeenCalled()
    expect(screen.getByText('Invitación enviada.')).toBeInTheDocument()
  })

  it('changes a member role and reloads the team', async () => {
    const reload = vi.fn()
    mocks.updateTeamMemberRole.mockResolvedValue({ role: 'COACH' })
    mocks.useTeam.mockReturnValue(state({ reload }))

    renderDetail()

    fireEvent.click(screen.getByRole('button', { name: 'Hacer entrenador' }))

    await waitFor(() =>
      expect(mocks.updateTeamMemberRole).toHaveBeenCalledWith(5, 2, 'COACH'),
    )
    expect(reload).toHaveBeenCalled()
    expect(screen.getByText('Rol actualizado.')).toBeInTheDocument()
  })

  it('confirms removing a member', async () => {
    const reload = vi.fn()
    mocks.removeTeamMember.mockResolvedValue()
    mocks.useTeam.mockReturnValue(state({ reload }))

    renderDetail()

    fireEvent.click(screen.getByRole('button', { name: 'Expulsar' }))
    expect(
      screen.getByText('¿Seguro que querés expulsar a frag del equipo?'),
    ).toBeInTheDocument()

    const buttons = screen.getAllByRole('button', { name: 'Expulsar' })
    fireEvent.click(buttons[buttons.length - 1])

    await waitFor(() =>
      expect(mocks.removeTeamMember).toHaveBeenCalledWith(5, 2),
    )
    expect(reload).toHaveBeenCalled()
  })

  it('shows live presence for current members only', () => {
    mocks.useRealtime.mockReturnValue({
      presenceByTeam: {
        5: {
          team_id: 5,
          members: [{ user_id: 1, username: 'cap', role: 'CAPTAIN' }],
        },
      },
      activityByTeam: {},
    })
    mocks.useTeam.mockReturnValue(state())

    renderDetail()

    expect(screen.getByText('1/2 en línea')).toBeInTheDocument()
    expect(screen.getByText('En línea')).toBeInTheDocument()
    expect(screen.getByText('Desconectado')).toBeInTheDocument()
  })

  it('hides presence from outsiders', () => {
    mocks.useRealtime.mockReturnValue({
      presenceByTeam: {
        5: {
          team_id: 5,
          members: [{ user_id: 1, username: 'cap', role: 'CAPTAIN' }],
        },
      },
      activityByTeam: {},
    })
    mocks.useTeam.mockReturnValue(
      state({
        team: team({
          is_member: false,
          my_role: null,
          permissions: {
            can_edit: false,
            can_manage_members: false,
            can_change_roles: false,
            can_manage_invitations: false,
            can_invite: false,
            can_transfer_captain: false,
            can_leave: false,
          },
          pending_invitations: undefined,
        }),
      }),
    )

    renderDetail()

    expect(screen.queryByText('1/2 en línea')).not.toBeInTheDocument()
    expect(screen.queryByText('En línea')).not.toBeInTheDocument()
  })

  it('loads the team activity history for members', async () => {
    mocks.fetchTeamActivity.mockResolvedValue({
      activities: [
        {
          id: 3,
          event_id: 'act-3',
          team_id: 5,
          activity_type: 'member.role_changed',
          description: 'cap cambió el rol de frag a Entrenador.',
          actor: { user_id: 1, username: 'cap' },
          resource_type: 'team',
          resource_id: 5,
          path: '/teams/5',
          metadata: {},
          created_at: '2026-11-08T10:00:00+00:00',
        },
      ],
      meta: { total: 1, page: 1, per_page: 20 },
    })
    mocks.useTeam.mockReturnValue(state())

    renderDetail()

    await waitFor(() =>
      expect(mocks.fetchTeamActivity).toHaveBeenCalledWith(5, {
        page: 1,
        perPage: 20,
      }),
    )
    expect(
      await screen.findByRole('heading', { name: 'Actividad' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('cap cambió el rol de frag a Entrenador.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Cambio de rol')).toBeInTheDocument()
    expect(screen.getByText('por cap')).toBeInTheDocument()
  })

  it('does not request activity for outsiders', () => {
    mocks.useTeam.mockReturnValue(
      state({
        team: team({
          is_member: false,
          my_role: null,
          permissions: {
            can_edit: false,
            can_manage_members: false,
            can_change_roles: false,
            can_manage_invitations: false,
            can_invite: false,
            can_transfer_captain: false,
            can_leave: false,
          },
          pending_invitations: undefined,
        }),
      }),
    )

    renderDetail()

    expect(mocks.fetchTeamActivity).not.toHaveBeenCalled()
    expect(
      screen.queryByRole('heading', { name: 'Actividad' }),
    ).not.toBeInTheDocument()
  })
})
