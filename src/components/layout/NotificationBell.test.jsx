import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const realtime = vi.hoisted(() => ({
  current: null,
}))

vi.mock('../../context/RealtimeContext.jsx', () => ({
  useRealtime: () => realtime.current,
}))

import NotificationBell from './NotificationBell.jsx'

const NOTIFICATION = {
  id: 'evt-1',
  event_id: 'evt-1',
  notification_id: 12,
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

const READ_NOTIFICATION = {
  ...NOTIFICATION,
  id: 'evt-0',
  event_id: 'evt-0',
  notification_id: 11,
  title: 'Invitación anterior',
  read: true,
  read_at: '2026-11-07T10:00:00+00:00',
}

const PROPOSAL = {
  id: 'evt-2',
  event_id: 'evt-2',
  notification_id: 13,
  event_type: 'grenade.proposal.approved',
  created_at: '2026-11-08T11:00:00+00:00',
  title: 'Propuesta aprobada',
  message: 'Tu propuesta fue aprobada.',
  read: false,
  resource: {
    type: 'team_lineup',
    id: 91,
    team_id: 3,
    path: '/teams/3/lineups/91',
  },
  metadata: {},
}

function LocationProbe() {
  const location = useLocation()
  return <span data-testid="location">{location.pathname}</span>
}

function renderBell() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <NotificationBell />
      <Routes>
        <Route path="*" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  )
}

function baseRealtime(overrides = {}) {
  return {
    notifications: [],
    unreadCount: 0,
    status: 'connected',
    lastError: '',
    notificationsLoading: false,
    notificationsError: '',
    hasMore: false,
    loadMoreNotifications: vi.fn(),
    refreshNotifications: vi.fn(),
    markNotificationRead: vi.fn().mockResolvedValue(undefined),
    markAllRead: vi.fn().mockResolvedValue(undefined),
    clearNotifications: vi.fn(),
    ...overrides,
  }
}

function openPanel() {
  fireEvent.click(screen.getByRole('button', { name: /Notificaciones/ }))
}

describe('NotificationBell', () => {
  beforeEach(() => {
    realtime.current = baseRealtime()
  })

  it('shows the unread counter in the bell', () => {
    realtime.current = baseRealtime({ unreadCount: 3 })
    renderBell()
    expect(
      screen.getByRole('button', { name: 'Notificaciones, 3 sin leer' }),
    ).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('does not mark everything as read just by opening the panel', () => {
    realtime.current = baseRealtime({
      notifications: [NOTIFICATION],
      unreadCount: 1,
    })
    renderBell()

    openPanel()

    expect(realtime.current.markAllRead).not.toHaveBeenCalled()
    expect(
      screen.getByRole('dialog', { name: 'Notificaciones' }),
    ).toHaveClass('open')
    expect(screen.getByText('Invitación recibida')).toBeInTheDocument()
    expect(screen.getByText('Invitación')).toBeInTheDocument()
    expect(screen.getByLabelText('Sin leer')).toBeInTheDocument()
  })

  it('marks a single notification as read without closing the panel', async () => {
    realtime.current = baseRealtime({
      notifications: [NOTIFICATION, READ_NOTIFICATION],
      unreadCount: 1,
    })
    renderBell()
    openPanel()

    fireEvent.click(screen.getByRole('button', { name: 'Marcar leída' }))

    await waitFor(() =>
      expect(realtime.current.markNotificationRead).toHaveBeenCalledWith(
        NOTIFICATION,
      ),
    )
    // Solo la no leída muestra el botón; la leída no.
    expect(
      screen.getAllByRole('button', { name: 'Marcar leída' }),
    ).toHaveLength(1)
    expect(
      screen.getByRole('dialog', { name: 'Notificaciones' }),
    ).toHaveClass('open')
  })

  it('marks all notifications as read explicitly', async () => {
    realtime.current = baseRealtime({
      notifications: [NOTIFICATION],
      unreadCount: 1,
    })
    renderBell()
    openPanel()

    fireEvent.click(
      screen.getByRole('button', { name: 'Marcar todas como leídas' }),
    )

    await waitFor(() =>
      expect(realtime.current.markAllRead).toHaveBeenCalledTimes(1),
    )
  })

  it('disables the mark-all action when there is nothing unread', () => {
    realtime.current = baseRealtime({
      notifications: [READ_NOTIFICATION],
      unreadCount: 0,
    })
    renderBell()
    openPanel()

    expect(
      screen.getByRole('button', { name: 'Marcar todas como leídas' }),
    ).toBeDisabled()
  })

  it('renders the empty state when there are no notifications', () => {
    renderBell()
    openPanel()
    expect(screen.getByText('No hay notificaciones.')).toBeInTheDocument()
  })

  it('renders the loading state while the history is fetched', () => {
    realtime.current = baseRealtime({ notificationsLoading: true })
    renderBell()
    openPanel()
    expect(
      screen.getByText('Cargando notificaciones…'),
    ).toBeInTheDocument()
  })

  it('renders an error state and retries the history', () => {
    realtime.current = baseRealtime({
      notificationsError: 'No pudimos cargar el historial de notificaciones.',
    })
    renderBell()
    openPanel()

    expect(screen.getByRole('alert')).toHaveTextContent(
      'No pudimos cargar el historial de notificaciones.',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(realtime.current.refreshNotifications).toHaveBeenCalledTimes(1)
  })

  it('loads more notifications from the persistent history', () => {
    realtime.current = baseRealtime({
      notifications: [NOTIFICATION],
      unreadCount: 1,
      hasMore: true,
    })
    renderBell()
    openPanel()

    fireEvent.click(screen.getByRole('button', { name: 'Ver más' }))
    expect(realtime.current.loadMoreNotifications).toHaveBeenCalledTimes(1)
  })

  it('navigates to the internal resource, marks it read and closes the panel', async () => {
    realtime.current = baseRealtime({
      notifications: [PROPOSAL],
      unreadCount: 1,
    })
    renderBell()
    openPanel()

    fireEvent.click(screen.getByText('Propuesta aprobada'))

    expect(screen.getByTestId('location')).toHaveTextContent(
      '/teams/3/lineups/91',
    )
    expect(document.querySelector('.notification-panel')).not.toHaveClass('open')
    await waitFor(() =>
      expect(realtime.current.markNotificationRead).toHaveBeenCalledWith(
        PROPOSAL,
      ),
    )
  })

  it('does not mark a read notification again when navigating', () => {
    realtime.current = baseRealtime({
      notifications: [READ_NOTIFICATION],
      unreadCount: 0,
    })
    renderBell()
    openPanel()

    fireEvent.click(screen.getByText('Invitación anterior'))

    expect(realtime.current.markNotificationRead).not.toHaveBeenCalled()
  })

  it('closes the panel with Escape', () => {
    realtime.current = baseRealtime({ notifications: [NOTIFICATION] })
    renderBell()
    openPanel()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(document.querySelector('.notification-panel')).not.toHaveClass('open')
  })

  it('shows a warning without breaking the UI when realtime is down', () => {
    realtime.current = baseRealtime({
      status: 'error',
      lastError: 'Sin conexión con el servicio de notificaciones.',
    })
    renderBell()
    openPanel()

    expect(
      screen.getByText('Sin conexión con el servicio de notificaciones.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Sin conexión con el servicio de notificaciones.',
    )
  })

  it('shows a fallback warning when disconnected without a message', () => {
    realtime.current = baseRealtime({ status: 'disconnected' })
    renderBell()
    openPanel()

    expect(screen.getByRole('status')).toHaveTextContent(
      'El servicio de notificaciones no está disponible.',
    )
  })

  it('renders notification text as data, never as HTML', () => {
    realtime.current = baseRealtime({
      notifications: [
        {
          ...NOTIFICATION,
          title: '<img src=x onerror=alert(1)>',
          message: '<script>alert(1)</script>',
        },
      ],
      unreadCount: 1,
    })
    renderBell()
    openPanel()

    expect(
      screen.getByText('<img src=x onerror=alert(1)>'),
    ).toBeInTheDocument()
    expect(document.querySelector('.notification-list img')).toBeNull()
    expect(document.querySelector('.notification-list script')).toBeNull()
  })
})
