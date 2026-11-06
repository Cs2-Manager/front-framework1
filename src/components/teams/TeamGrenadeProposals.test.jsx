import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import TeamGrenadeProposals from './TeamGrenadeProposals.jsx'

const mocks = vi.hoisted(() => ({
  fetchTeamGrenadeProposals: vi.fn(),
  approveGrenadeProposal: vi.fn(),
  rejectGrenadeProposal: vi.fn(),
}))

vi.mock('../../services/grenadeLineups.js', () => ({
  PROPOSAL_STATUS_LABELS: {
    PENDING: 'Pendiente',
    APPROVED: 'Aprobada',
    REJECTED: 'Rechazada',
    CANCELLED: 'Cancelada',
  },
  fetchTeamGrenadeProposals: mocks.fetchTeamGrenadeProposals,
  approveGrenadeProposal: mocks.approveGrenadeProposal,
  rejectGrenadeProposal: mocks.rejectGrenadeProposal,
}))

const team = {
  id: 1,
  is_member: true,
  permissions: { can_manage_lineups: true },
}

const pending = {
  id: 5,
  map_id: 2,
  status: 'PENDING',
  note: 'Para el oficial',
  author_username: 'ana',
  created_at: '2026-02-01T10:00:00',
  snapshot: { title: 'Smoke CT' },
}

beforeEach(() => {
  vi.resetAllMocks()
  mocks.fetchTeamGrenadeProposals.mockResolvedValue([pending])
  mocks.approveGrenadeProposal.mockResolvedValue({})
  mocks.rejectGrenadeProposal.mockResolvedValue({})
})

describe('TeamGrenadeProposals', () => {
  it('stays hidden for members without review permissions', () => {
    const { container } = render(
      <TeamGrenadeProposals
        team={{ id: 1, is_member: true, permissions: { can_manage_lineups: false } }}
      />,
    )

    expect(container).toBeEmptyDOMElement()
    expect(mocks.fetchTeamGrenadeProposals).not.toHaveBeenCalled()
  })

  it('stays hidden for non-members even if they are administrators', () => {
    const { container } = render(
      <TeamGrenadeProposals
        team={{ id: 1, is_member: false, permissions: { can_manage_lineups: true } }}
      />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('lists pending proposals and approves them', async () => {
    render(<TeamGrenadeProposals team={team} />)

    expect(await screen.findByText('Smoke CT')).toBeInTheDocument()
    expect(screen.getByText('Pendiente')).toBeInTheDocument()
    expect(screen.getByText('Para el oficial')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Aprobar' }))

    await waitFor(() =>
      expect(mocks.approveGrenadeProposal).toHaveBeenCalledWith(5),
    )
    expect(
      await screen.findByText(
        'Propuesta aprobada: se creó la granada de equipo.',
      ),
    ).toBeInTheDocument()
  })

  it('rejects a proposal with an optional reason', async () => {
    render(<TeamGrenadeProposals team={team} />)

    await screen.findByText('Smoke CT')
    fireEvent.click(screen.getByRole('button', { name: 'Rechazar' }))
    fireEvent.change(screen.getByLabelText('Motivo del rechazo (opcional)'), {
      target: { value: 'Falta el video' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Rechazar propuesta' }))

    await waitFor(() =>
      expect(mocks.rejectGrenadeProposal).toHaveBeenCalledWith(5, {
        reason: 'Falta el video',
      }),
    )
    expect(await screen.findByText('Propuesta rechazada.')).toBeInTheDocument()
  })

  it('filters proposals by status', async () => {
    render(<TeamGrenadeProposals team={team} />)

    await screen.findByText('Smoke CT')
    expect(mocks.fetchTeamGrenadeProposals).toHaveBeenCalledWith(1, {
      status: 'PENDING',
    })

    fireEvent.change(screen.getByLabelText('Estado'), {
      target: { value: 'ALL' },
    })

    await waitFor(() =>
      expect(mocks.fetchTeamGrenadeProposals).toHaveBeenLastCalledWith(1, {
        status: undefined,
      }),
    )
  })
})
