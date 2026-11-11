import { createContext, useCallback, useContext, useEffect, useMemo } from 'react'

import { useAuth } from './AuthContext.jsx'
import {
  normalizeNotification,
  normalizePresence,
  normalizeTeamActivity,
} from './realtimeUtils.js'
import useNotificationHistory from './useNotificationHistory.js'
import useRealtimeSocket from './useRealtimeSocket.js'

export {
  normalizeNotification,
  normalizePresence,
  normalizeTeamActivity,
}

const RealtimeContext = createContext(null)

export function RealtimeProvider({ children }) {
  const { user, token } = useAuth()
  const userId = user?.id ?? null

  const history = useNotificationHistory()
  const { receive, refresh, isLoaded, reset } = history

  const handleConnect = useCallback(
    (wasConnected) => {
      if (!isLoaded() || wasConnected) refresh()
    },
    [isLoaded, refresh],
  )

  const handleNotification = useCallback(
    (payload) => {
      receive(normalizeNotification(payload))
    },
    [receive],
  )

  const socket = useRealtimeSocket({
    token,
    userId,
    onNotification: handleNotification,
    onConnect: handleConnect,
  })
  const { clear: clearSocket } = socket

  useEffect(() => {
    reset()
  }, [userId, token, reset])

  useEffect(() => {
    if (!token || !userId) return
    void history.load({ page: 1 })
  }, [token, userId, history.load])

  const clearNotifications = useCallback(() => {
    reset()
    clearSocket()
  }, [reset, clearSocket])

  const value = useMemo(
    () => ({
      notifications: history.notifications,
      notificationsMeta: history.meta,
      notificationsLoading: history.loading,
      notificationsError: history.error,
      hasMore: history.hasMore,
      unreadCount: history.unreadCount,
      presenceByTeam: socket.presenceByTeam,
      activityByTeam: socket.activityByTeam,
      status: socket.status,
      lastError: socket.lastError,
      loadMoreNotifications: history.loadMore,
      refreshNotifications: history.refresh,
      markNotificationRead: history.markRead,
      markAllRead: history.markAllRead,
      clearNotifications,
    }),
    [
      history.notifications,
      history.meta,
      history.loading,
      history.error,
      history.hasMore,
      history.unreadCount,
      history.loadMore,
      history.refresh,
      history.markRead,
      history.markAllRead,
      socket.presenceByTeam,
      socket.activityByTeam,
      socket.status,
      socket.lastError,
      clearNotifications,
    ],
  )

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  )
}

export function useRealtime() {
  const context = useContext(RealtimeContext)
  if (!context) {
    throw new Error('useRealtime debe usarse dentro de <RealtimeProvider>.')
  }
  return context
}
