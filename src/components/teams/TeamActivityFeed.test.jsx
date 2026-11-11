import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  useRealtime: vi.fn(),
  fetchTeamActivity: vi.fn(),
}))

vi.mock('../../context/RealtimeContext.jsx', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRealtime: mocks.useRealtime,
  }
})

vi.mock('../../services/teamActivity.js', () => ({
  fetchTeamActivity: mocks.fetchTeamActivity,
}))

import TeamActivityFeed from './TeamActivityFeed.jsx'

function activity(overrides = {}) {
  return {
    id: 1,
    event_id: 'act-1',
    team_id: 5,
    activity_type: 'member.joined',
    description: 'carol se unió al equipo.',
    actor: { user_id: 8, username: 'carol' },
    resource_type: 'team',
    resource_id: 5,
    path: '/teams/5',
    metadata: {},
    created_at: '2026-11-08T10:00:00+00:00',
    ...overrides,
  }
}

function renderFeed(props = {}) {
  return render(
    <MemoryRouter>
      <TeamActivityFeed teamId={5} isMember {...props} />
    </MemoryRouter>,
  )
}

describe('TeamActivityFeed', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mocks.useRealtime.mockReturnValue({ activityByTeam: {} })
    mocks.fetchTeamActivity.mockResolvedValue({
      activities: [],
      meta: { total: 0, page: 1, per_page: 20 },
    })
  })

  it('does not render or fetch for non-members', () => {
    renderFeed({ isMember: false })

    expect(mocks.fetchTeamActivity).not.toHaveBeenCalled()
    expect(
      screen.queryByRole('heading', { name: 'Actividad' }),
    ).not.toBeInTheDocument()
  })

  it('renders the empty state when the team has no activity', async () => {
    renderFeed()

    expect(
      await screen.findByText(
        'Todavía no hay actividad registrada en este equipo.',
      ),
    ).toBeInTheDocument()
    expect(mocks.fetchTeamActivity).toHaveBeenCalledWith(5, {
      page: 1,
      perPage: 20,
    })
  })

  it('renders activities with human labels, actor and resource link', async () => {
    mocks.fetchTeamActivity.mockResolvedValue({
      activities: [
        activity(),
        activity({
          id: 2,
          event_id: 'act-2',
          activity_type: 'grenade.proposal.approved',
          description: 'cap aprobó la propuesta "Smoke A".',
          actor: { user_id: 1, username: 'cap' },
          path: '/teams/5/lineups/9',
          created_at: '2026-11-08T11:00:00+00:00',
        }),
      ],
      meta: { total: 2, page: 1, per_page: 20 },
    })

    renderFeed()

    expect(
      await screen.findByText('cap aprobó la propuesta "Smoke A".'),
    ).toBeInTheDocument()
    expect(screen.getByText('Propuesta aprobada')).toBeInTheDocument()
    expect(screen.getByText('Nuevo integrante')).toBeInTheDocument()
    expect(screen.getByText('por carol')).toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: 'Ver detalle' })[0],
    ).toHaveAttribute('href', '/teams/5/lineups/9')
  })

  it('loads additional pages with the load-more action', async () => {
    mocks.fetchTeamActivity.mockResolvedValueOnce({
      activities: [activity()],
      meta: { total: 2, page: 1, per_page: 20 },
    })
    mocks.fetchTeamActivity.mockResolvedValueOnce({
      activities: [
        activity({
          id: 2,
          event_id: 'act-2',
          description: 'cap cambió el rol de frag.',
          activity_type: 'member.role_changed',
          created_at: '2026-11-07T10:00:00+00:00',
        }),
      ],
      meta: { total: 2, page: 2, per_page: 20 },
    })

    renderFeed()

    fireEvent.click(
      await screen.findByRole('button', { name: 'Ver más actividad' }),
    )

    await waitFor(() =>
      expect(mocks.fetchTeamActivity).toHaveBeenLastCalledWith(5, {
        page: 2,
        perPage: 20,
      }),
    )
    expect(
      await screen.findByText('cap cambió el rol de frag.'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Ver más actividad' }),
    ).not.toBeInTheDocument()
  })

  it('merges live activity from the socket without duplicates', async () => {
    const live = activity({
      id: 7,
      event_id: 'act-live',
      activity_type: 'member.left',
      description: 'frag abandonó el equipo.',
      actor: { user_id: 2, username: 'frag' },
      created_at: '2026-11-08T12:00:00+00:00',
    })
    mocks.useRealtime.mockReturnValue({
      activityByTeam: { 5: [live] },
    })

    renderFeed()

    expect(
      await screen.findByText('frag abandonó el equipo.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Salida')).toBeInTheDocument()
    // Solo aparece una vez aunque venga del historial y del socket.
    expect(screen.getAllByText('frag abandonó el equipo.')).toHaveLength(1)
  })

  it('shows an error and retries the request', async () => {
    mocks.fetchTeamActivity.mockRejectedValueOnce(new Error('boom'))
    mocks.fetchTeamActivity.mockResolvedValueOnce({
      activities: [activity()],
      meta: { total: 1, page: 1, per_page: 20 },
    })

    renderFeed()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No pudimos cargar la actividad del equipo.',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(
      await screen.findByText('carol se unió al equipo.'),
    ).toBeInTheDocument()
  })

  it('falls back to a readable label for unknown activity types', async () => {
    mocks.fetchTeamActivity.mockResolvedValue({
      activities: [
        activity({
          activity_type: 'team.unknown.event',
          description: 'Algo pasó.',
        }),
      ],
      meta: { total: 1, page: 1, per_page: 20 },
    })

    renderFeed()

    expect(await screen.findByText('team · unknown · event')).toBeInTheDocument()
  })
})
