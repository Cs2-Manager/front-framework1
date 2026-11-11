import api from './api'

const DEFAULT_PAGE_SIZE = 20

/**
 * Historial persistente de notificaciones. El backend calcula la visibilidad
 * según la membresía actual del usuario; el cliente nunca envía `user_id`.
 */
export async function fetchNotifications({
  page = 1,
  perPage = DEFAULT_PAGE_SIZE,
} = {}) {
  const { data } = await api.get('/notifications', {
    params: { page, per_page: perPage },
  })
  return {
    notifications: data.notifications || [],
    meta: data.meta || { total: 0, page, per_page: perPage },
    unreadCount: data.unread_count || 0,
  }
}

export async function fetchUnreadCount() {
  const { data } = await api.get('/notifications/unread-count')
  return data.unread_count || 0
}

export async function markNotificationRead(notificationId) {
  const { data } = await api.post(`/notifications/${notificationId}/read`)
  return {
    notification: data.notification,
    unreadCount: data.unread_count || 0,
  }
}

export async function markAllNotificationsRead() {
  const { data } = await api.post('/notifications/read-all')
  return {
    updated: data.updated || 0,
    unreadCount: data.unread_count || 0,
  }
}
