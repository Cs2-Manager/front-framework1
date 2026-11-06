import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import Invitations from './Invitations.jsx'

const mocks = vi.hoisted(() => ({
  useMyInvitations: vi.fn(),
  acceptInvitation: vi.fn(),
  rejectInvitation: vi.fn(),
}))

vi.mock('../hooks/useTeams.js', () => ({
  useMyInvitations: mocks.useMyInvitations,
}))
vi.mock('../services/teams.js', () => ({
  acceptInvitation: mocks.acceptInvitation,
  rejectInvitation: mocks.rejectInvitation,
}))

const INVITATION = {
  id: 7,
  role: 'COACH',
  status: 'PENDING',
  created_at: '2026-01-04T00:00:00',
  responded_at: null,
  invited_by: { id: 1, username: 'cap', nickname: 'Captain' },
  team: { id: 5, name: 'Alpha Wolves', tag: 'AW', country: 'AR' },
}

function state(overrides = {}) {
  return {
    invitations: [],
    meta: { total: 0 },
    loading: false,
    error: '',
    reload: vi.fn(),
    ...overrides,
  }
}

function renderInvitations() {
  return render(
    <MemoryRouter>
      <Invitations />
    </MemoryRouter>,
  )
}

describe('Invitations page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('shows loading and empty states', () => {
    mocks.useMyInvitations.mockReturnValue(state({ loading: true }))
    const { rerender } = renderInvitations()

    expect(screen.getByRole('status')).toHaveTextContent('Cargando invitaciones…')
    expect(mocks.useMyInvitations).toHaveBeenCalledWith('PENDING')

    mocks.useMyInvitations.mockReturnValue(state())
    rerender(
      <MemoryRouter>
        <Invitations />
      </MemoryRouter>,
    )

    expect(screen.getByText('No tenés invitaciones pendientes.')).toBeInTheDocument()
  })

  it('renders an invitation with its real data', () => {
    mocks.useMyInvitations.mockReturnValue(
      state({ invitations: [INVITATION], meta: { total: 1 } }),
    )

    renderInvitations()

    expect(screen.getByText('1 invitación')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Alpha Wolves' })).toHaveAttribute(
      'href',
      '/teams/5',
    )
    expect(screen.getByText('Pendiente')).toBeInTheDocument()
    expect(screen.getByText(/Rol ofrecido: Entrenador/)).toBeInTheDocument()
    expect(screen.getByText(/Invitación de Captain/)).toBeInTheDocument()
  })

  it('accepts an invitation and reloads', async () => {
    const reload = vi.fn()
    mocks.acceptInvitation.mockResolvedValue({})
    mocks.useMyInvitations.mockReturnValue(
      state({ invitations: [INVITATION], meta: { total: 1 }, reload }),
    )

    renderInvitations()

    fireEvent.click(screen.getByRole('button', { name: 'Aceptar' }))

    await waitFor(() => expect(mocks.acceptInvitation).toHaveBeenCalledWith(7))
    expect(reload).toHaveBeenCalled()
    expect(screen.getByText('Invitación aceptada.')).toBeInTheDocument()
  })

  it('rejects an invitation and reloads', async () => {
    const reload = vi.fn()
    mocks.rejectInvitation.mockResolvedValue({ id: 7 })
    mocks.useMyInvitations.mockReturnValue(
      state({ invitations: [INVITATION], meta: { total: 1 }, reload }),
    )

    renderInvitations()

    fireEvent.click(screen.getByRole('button', { name: 'Rechazar' }))

    await waitFor(() => expect(mocks.rejectInvitation).toHaveBeenCalledWith(7))
    expect(reload).toHaveBeenCalled()
    expect(screen.getByText('Invitación rechazada.')).toBeInTheDocument()
  })

  it('shows an error from the API when responding fails', async () => {
    mocks.acceptInvitation.mockRejectedValue({
      response: { data: { error: 'User already belongs to a team' } },
    })
    mocks.useMyInvitations.mockReturnValue(
      state({ invitations: [INVITATION], meta: { total: 1 } }),
    )

    renderInvitations()

    fireEvent.click(screen.getByRole('button', { name: 'Aceptar' }))

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'User already belongs to a team',
      ),
    )
  })

  it('filters between pending and all invitations', () => {
    mocks.useMyInvitations.mockReturnValue(state())

    renderInvitations()

    fireEvent.click(screen.getByRole('button', { name: 'Todas' }))

    expect(mocks.useMyInvitations).toHaveBeenLastCalledWith('ALL')
    expect(
      screen.getByText('Todavía no recibiste invitaciones.'),
    ).toBeInTheDocument()
  })
})
