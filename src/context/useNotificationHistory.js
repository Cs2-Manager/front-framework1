import { useCallback, useRef, useState } from 'react'

import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/notifications.js'
import {
  normalizeNotification,
  mergeById,
  positiveInt,
  HISTORY_ERROR,
  READ_ERROR,
  MAX_NOTIFICATIONS,
} from './realtimeUtils.js'

export const NOTIFICATIONS_PAGE_SIZE = 20

const EMPTY_META = { total: 0, page: 1, per_page: NOTIFICATIONS_PAGE_SIZE }

/**
 * Historial persistente de notificaciones (REST) y su contador de no leídas.
 * No conoce Socket.IO: el proveedor le entrega los eventos en vivo con `receive`.
 */
export default function useNotificationHistory() {
  const [notifications, setNotifications] = useState([])
  const [meta, setMeta] = useState(EMPTY_META)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)

  const knownRef = useRef(new Set())
  const loadedRef = useRef(false)
  const requestRef = useRef(0)
  const sessionRef = useRef(0)

  const load = useCallback(async ({ page: nextPage = 1, append = false } = {}) => {
    const requestId = requestRef.current + 1
    requestRef.current = requestId
    setLoading(true)
    setError('')
    try {
      const result = await fetchNotifications({
        page: nextPage,
        perPage: NOTIFICATIONS_PAGE_SIZE,
      })
      if (requestRef.current !== requestId) return
      const normalized = result.notifications
        .map(normalizeNotification)
        .filter(Boolean)
      for (const item of normalized) knownRef.current.add(item.event_id)
      setNotifications((current) =>
        (append ? mergeById(current, normalized) : mergeById([], normalized)).slice(
          0,
          MAX_NOTIFICATIONS,
        ),
      )
      setMeta(result.meta)
      setPage(nextPage)
      setUnreadCount(result.unreadCount)
      loadedRef.current = true
    } catch {
      if (requestRef.current !== requestId) return
      setError(HISTORY_ERROR)
    } finally {
      if (requestRef.current === requestId) setLoading(false)
    }
  }, [])

  const refresh = useCallback(() => load({ page: 1 }), [load])

  const loadMore = useCallback(() => {
    if (loading) return
    if (notifications.length >= (meta.total || 0)) return
    void load({ page: page + 1, append: true })
  }, [load, notifications.length, loading, meta.total, page])

  const markRead = useCallback(async (notification) => {
    const session = sessionRef.current
    if (!notification) return
    const notificationId = positiveInt(notification.notification_id)
    if (!notificationId) {
      setNotifications((current) =>
        current.map((item) =>
          item.event_id === notification.event_id
            ? { ...item, read: true }
            : item,
        ),
      )
      return
    }
    try {
      const result = await markNotificationRead(notificationId)
      if (sessionRef.current !== session) return
      setUnreadCount(result.unreadCount)
      setNotifications((current) =>
        current.map((item) =>
          item.notification_id === notificationId
            ? {
                ...item,
                read: true,
                read_at: result.notification?.read_at || item.read_at,
              }
            : item,
        ),
      )
    } catch {
      if (sessionRef.current !== session) return
      setError(READ_ERROR)
    }
  }, [])

  const markAllRead = useCallback(async () => {
    const session = sessionRef.current
    try {
      const result = await markAllNotificationsRead()
      if (sessionRef.current !== session) return
      setUnreadCount(result.unreadCount)
      setNotifications((current) =>
        current.map((item) => ({ ...item, read: true })),
      )
    } catch {
      if (sessionRef.current !== session) return
      setError(READ_ERROR)
    }
  }, [])

  /** Inserta una notificación en vivo evitando duplicados por `event_id`. */
  const receive = useCallback((notification) => {
    if (!notification) return
    if (knownRef.current.has(notification.event_id)) return
    knownRef.current.add(notification.event_id)
    setNotifications((current) =>
      mergeById(current, [notification]).slice(0, MAX_NOTIFICATIONS),
    )
    setMeta((current) => ({
      ...current,
      total: (current.total || 0) + 1,
    }))
    setUnreadCount((count) => Math.min(count + 1, 99))
  }, [])

  const isLoaded = useCallback(() => loadedRef.current, [])

  const reset = useCallback(() => {
    // Invalidate mutations as well as loads when the authenticated session changes.
    sessionRef.current += 1
    knownRef.current.clear()
    loadedRef.current = false
    requestRef.current += 1
    setNotifications([])
    setMeta(EMPTY_META)
    setPage(1)
    setLoading(false)
    setError('')
    setUnreadCount(0)
  }, [])

  return {
    notifications,
    meta,
    loading,
    error,
    unreadCount,
    hasMore: (meta.total || 0) > notifications.length,
    load,
    refresh,
    loadMore,
    markRead,
    markAllRead,
    receive,
    isLoaded,
    reset,
  }
}
