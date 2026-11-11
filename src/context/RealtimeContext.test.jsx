import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const auth = vi.hoisted(() => ({
  current: { user: null, token: null },
}))

const services = vi.hoisted(() => ({
  fetchNotifications: vi.fn(),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
}))

vi.mock('./AuthContext.jsx', () => ({
  useAuth: () => auth.current,
}))

vi.mock('../services/notifications.js', () => services)

vi.mock('socket.io-client', () => ({
  io: vi.fn(),
}))

import { io } from 'socket.io-client'
import { RealtimeProvider, useRealtime } from './RealtimeContext.jsx'

function createSocket() {
  const handlers = new Map()
  const socket = {
    active: true,
    on: vi.fn((event, handler) => {
      const list = handlers.get(event) || []
      list.push(handler)
      handlers.set(event, list)
    }),
    off: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(() => {
      socket.active = false
    }),
    trigger(event, payload) {
      for (const handler of handlers.get(event) || []) handler(payload)
    },
  }
  return socket
}

function Probe() {
  const realtime = useRealtime()
  return (
    <div>
      <span data-testid="status">{realtime.status}</span>
      <span data-testid="unread">{realtime.unreadCount}</span>
      <span data-testid="error">{realtime.lastError}</span>
      <span data-testid="history-error">{realtime.notificationsError}</span>
      <span data-testid="presence">
        {(realtime.presenceByTeam[3]?.members || [])
          .map((member) => member.user_id)
          .join(',')}
      </span>
      <span data-testid="activity">
        {(realtime.activityByTeam[3] || [])
          .map((item) => item.description)
          .join('|')}
      </span>
      <ul>
        {realtime.notifications.map((item) => (
          <li key={item.event_id}>
            {item.title}
            {item.read ? ' (leída)' : ''}
          </li>
        ))}
      </ul>
      <button type="button" onClick={realtime.markAllRead}>
        marcar
      </button>
      <button
        type="button"
        onClick={() => realtime.markNotificationRead(realtime.notifications[0])}
      >
        marcar una
      </button>
      <button type="button" onClick={realtime.refreshNotifications}>
        refrescar
      </button>
      <button type="button" onClick={realtime.loadMoreNotifications}>
        más
      </button>
    </div>
  )
}

function renderProvider() {
  return render(
    <RealtimeProvider>
      <Probe />
    </RealtimeProvider>,
  )
}

const NOTIFICATION = {
  id: 'evt-1',
  event_id: 'evt-1',
  notification_id: 91,
  event_type: 'team.invitation.created',
  created_at: '2026-11-08T10:00:00+00:00',
  title: 'Invitación recibida',
  message: 'cap te invitó a Alpha Wolves como jugador.',
  read: false,
  resource: {
    type: 'invitation',
    id: 12,
    team_id: 3,
    path: '/invitations',
  },
  metadata: {},
}

const HISTORY = {
  notifications: [
    {
      ...NOTIFICATION,
      id: 'evt-0',
      event_id: 'evt-0',
      notification_id: 90,
      title: 'Historial previo',
      created_at: '2026-11-07T10:00:00+00:00',
    },
  ],
  meta: { total: 1, page: 1, per_page: 20 },
  unreadCount: 1,
}

describe('RealtimeProvider', () => {
  let sockets

  beforeEach(() => {
    sockets = []
    io.mockReset()
    io.mockImplementation(() => {
      const socket = createSocket()
      sockets.push(socket)
      return socket
    })
    services.fetchNotifications.mockReset()
    services.markNotificationRead.mockReset()
    services.markAllNotificationsRead.mockReset()
    services.fetchNotifications.mockResolvedValue(HISTORY)
    services.markAllNotificationsRead.mockResolvedValue({
      updated: 1,
      unreadCount: 0,
    })
    services.markNotificationRead.mockResolvedValue({
      notification: { ...NOTIFICATION, read: true, read_at: '2026-11-08T12:00:00Z' },
      unreadCount: 0,
    })
    auth.current = { user: { id: 7, username: 'bob' }, token: 'jwt-token' }
  })

  it('opens a single authenticated connection and reports connected', async () => {
    renderProvider()
    expect(io).toHaveBeenCalledTimes(1)
    expect(io).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/realtime/socket.io',
        auth: { token: 'jwt-token' },
        autoConnect: false,
      }),
    )
    expect(sockets[0].connect).toHaveBeenCalled()

    await waitFor(() =>
      expect(screen.getByText('Historial previo')).toBeInTheDocument(),
    )

    act(() => sockets[0].trigger('connect'))
    expect(screen.getByTestId('status')).toHaveTextContent('connected')
  })

  it('loads the persisted history and marks all as read through the API', async () => {
    renderProvider()

    await waitFor(() => expect(screen.getByTestId('unread')).toHaveTextContent('1'))
    expect(screen.getByText('Historial previo')).toBeInTheDocument()

    await act(async () => {
      screen.getByRole('button', { name: 'marcar' }).click()
    })

    expect(services.markAllNotificationsRead).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('unread')).toHaveTextContent('0')
    expect(screen.getByText('Historial previo (leída)')).toBeInTheDocument()
  })

  it('marks a single notification as read using its persisted id', async () => {
    renderProvider()
    await waitFor(() =>
      expect(screen.getByText('Historial previo')).toBeInTheDocument(),
    )

    await act(async () => {
      screen.getByRole('button', { name: 'marcar una' }).click()
    })

    expect(services.markNotificationRead).toHaveBeenCalledWith(90)
    expect(screen.getByTestId('unread')).toHaveTextContent('0')
    expect(screen.getByText('Historial previo (leída)')).toBeInTheDocument()
  })

  it('receives live notifications, counts new ones and ignores duplicates', async () => {
    renderProvider()
    await waitFor(() =>
      expect(screen.getByText('Historial previo')).toBeInTheDocument(),
    )
    act(() => sockets[0].trigger('connect'))
    act(() => sockets[0].trigger('notification', NOTIFICATION))

    expect(screen.getByText('Invitación recibida')).toBeInTheDocument()
    expect(screen.getByTestId('unread')).toHaveTextContent('2')

    act(() => sockets[0].trigger('notification', NOTIFICATION))
    expect(screen.getAllByText('Invitación recibida')).toHaveLength(1)
    expect(screen.getByTestId('unread')).toHaveTextContent('2')
  })

  it('drops messages with unsafe or missing navigation paths', async () => {
    renderProvider()
    await waitFor(() =>
      expect(screen.getByText('Historial previo')).toBeInTheDocument(),
    )
    act(() => sockets[0].trigger('connect'))
    act(() =>
      sockets[0].trigger('notification', {
        ...NOTIFICATION,
        event_id: 'evt-2',
        resource: { ...NOTIFICATION.resource, path: 'https://evil.example' },
      }),
    )
    expect(screen.getByTestId('unread')).toHaveTextContent('1')
  })

  it('resynchronizes history and unread count after reconnecting', async () => {
    renderProvider()
    await waitFor(() =>
      expect(screen.getByText('Historial previo')).toBeInTheDocument(),
    )

    act(() => sockets[0].trigger('connect'))
    act(() => sockets[0].trigger('connect_error', new Error('network')))
    expect(screen.getByTestId('status')).toHaveTextContent('reconnecting')
    expect(screen.getByTestId('error')).toHaveTextContent('Sin conexión')

    act(() => sockets[0].trigger('connect'))
    await waitFor(() =>
      expect(services.fetchNotifications).toHaveBeenCalledTimes(2),
    )
    expect(screen.getByTestId('status')).toHaveTextContent('connected')
    expect(screen.getByTestId('error')).toBeEmptyDOMElement()
  })

  it('updates presence and team activity from socket events', async () => {
    renderProvider()
    await waitFor(() =>
      expect(screen.getByText('Historial previo')).toBeInTheDocument(),
    )

    act(() =>
      sockets[0].trigger('presence.snapshot', {
        team_id: 3,
        members: [
          { user_id: 7, username: 'bob', role: 'PLAYER' },
          { user_id: 8, username: 'carol', role: 'COACH' },
        ],
      }),
    )
    expect(screen.getByTestId('presence')).toHaveTextContent('7,8')

    act(() =>
      sockets[0].trigger('presence.updated', {
        team_id: 3,
        members: [{ user_id: 8, username: 'carol', role: 'COACH' }],
      }),
    )
    expect(screen.getByTestId('presence')).toHaveTextContent('8')

    const activity = {
      event_id: 'act-1',
      team_id: 3,
      activity_id: 5,
      activity_type: 'member.joined',
      description: 'carol se unió al equipo.',
      actor: { user_id: 8, username: 'carol' },
      resource_type: 'team',
      resource_id: 3,
      path: '/teams/3',
      metadata: {},
      created_at: '2026-11-08T10:00:00Z',
    }
    act(() => sockets[0].trigger('team.activity', activity))
    act(() => sockets[0].trigger('team.activity', activity))
    expect(screen.getByTestId('activity')).toHaveTextContent(
      'carol se unió al equipo.',
    )
    expect(screen.getByTestId('activity').textContent).toBe(
      'carol se unió al equipo.',
    )
  })

  it('stops retrying on invalid or expired sessions', async () => {
    renderProvider()
    await waitFor(() =>
      expect(screen.getByText('Historial previo')).toBeInTheDocument(),
    )
    const error = new Error('expired')
    error.data = { code: 'AUTH_EXPIRED' }
    act(() => sockets[0].trigger('connect_error', error))

    expect(screen.getByTestId('status')).toHaveTextContent('error')
    expect(sockets[0].disconnect).toHaveBeenCalled()
  })

  it('keeps the history visible when realtime is unavailable', async () => {
    services.fetchNotifications.mockRejectedValueOnce(new Error('offline'))
    renderProvider()

    await waitFor(() =>
      expect(screen.getByTestId('history-error')).toHaveTextContent(
        'No pudimos cargar el historial',
      ),
    )
    expect(screen.getByTestId('unread')).toHaveTextContent('0')
  })

  it('cleans notifications and disconnects on logout', async () => {
    const view = renderProvider()
    await waitFor(() =>
      expect(screen.getByText('Historial previo')).toBeInTheDocument(),
    )
    act(() => sockets[0].trigger('connect'))
    act(() => sockets[0].trigger('notification', NOTIFICATION))
    expect(screen.getByTestId('unread')).toHaveTextContent('2')

    auth.current = { user: null, token: null }
    view.rerender(
      <RealtimeProvider>
        <Probe />
      </RealtimeProvider>,
    )

    expect(sockets[0].disconnect).toHaveBeenCalled()
    expect(screen.getByTestId('unread')).toHaveTextContent('0')
    expect(screen.queryByText('Invitación recibida')).not.toBeInTheDocument()
    expect(screen.getByTestId('status')).toHaveTextContent('idle')
  })

  it('clears state and reconnects when the account changes', async () => {
    const view = renderProvider()
    await waitFor(() =>
      expect(screen.getByText('Historial previo')).toBeInTheDocument(),
    )
    act(() => sockets[0].trigger('connect'))

    services.fetchNotifications.mockResolvedValue({
      notifications: [],
      meta: { total: 0, page: 1, per_page: 20 },
      unreadCount: 0,
    })
    auth.current = { user: { id: 8, username: 'carol' }, token: 'other-jwt' }
    view.rerender(
      <RealtimeProvider>
        <Probe />
      </RealtimeProvider>,
    )

    expect(sockets).toHaveLength(2)
    expect(sockets[0].disconnect).toHaveBeenCalled()
    expect(io).toHaveBeenLastCalledWith(
      expect.objectContaining({ auth: { token: 'other-jwt' } }),
    )
    await waitFor(() =>
      expect(screen.queryByText('Historial previo')).not.toBeInTheDocument(),
    )
    expect(screen.getByTestId('unread')).toHaveTextContent('0')
  })
})
