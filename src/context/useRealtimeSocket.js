import { useCallback, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

import {
  normalizePresence,
  normalizeTeamActivity,
  byNewest,
  FATAL_CODES,
  MAX_ACTIVITIES,
} from './realtimeUtils.js'

const SOCKET_OPTIONS = {
  path: import.meta.env.VITE_REALTIME_PATH || '/realtime/socket.io',
  autoConnect: false,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
  randomizationFactor: 0.5,
  timeout: 10000,
}

const AUTH_ERROR = 'Tu sesión no es válida para las notificaciones.'
const OFFLINE_ERROR = 'Sin conexión con el servicio de notificaciones.'

/**
 * Ciclo de vida de la conexión Socket.IO autenticada, presencia y actividad.
 * La autenticación y el historial viven fuera: este hook solo consume eventos.
 */
export default function useRealtimeSocket({
  token,
  userId,
  onNotification,
  onConnect,
}) {
  const [presenceByTeam, setPresenceByTeam] = useState({})
  const [activityByTeam, setActivityByTeam] = useState({})
  const [status, setStatus] = useState('idle')
  const [lastError, setLastError] = useState('')

  const socketRef = useRef(null)
  const connectedOnceRef = useRef(false)

  const clear = useCallback(() => {
    connectedOnceRef.current = false
    setPresenceByTeam({})
    setActivityByTeam({})
  }, [])

  useEffect(() => {
    clear()
    setLastError('')
    setStatus(token && userId ? 'connecting' : 'idle')

    if (!token || !userId) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      return undefined
    }

    const socket = io({ ...SOCKET_OPTIONS, auth: { token } })
    socketRef.current = socket

    function handleConnect() {
      setStatus('connected')
      setLastError('')
      onConnect(connectedOnceRef.current)
      connectedOnceRef.current = true
    }

    function handleDisconnect(reason) {
      if (reason === 'io client disconnect') return
      setStatus(socket.active ? 'reconnecting' : 'disconnected')
    }

    function handleConnectError(error) {
      const code = error?.data?.code
      if (FATAL_CODES.has(code)) {
        setStatus('error')
        setLastError(AUTH_ERROR)
        socket.disconnect()
        return
      }
      setStatus('reconnecting')
      setLastError(OFFLINE_ERROR)
    }

    function handleNotification(payload) {
      onNotification(payload)
    }

    function handlePresence(payload) {
      const presence = normalizePresence(payload)
      if (!presence) return
      setPresenceByTeam((current) => ({
        ...current,
        [presence.team_id]: presence,
      }))
    }

    function handleTeamActivity(payload) {
      const activity = normalizeTeamActivity(payload)
      if (!activity) return
      setActivityByTeam((current) => {
        const list = current[activity.team_id] || []
        if (list.some((item) => item.event_id === activity.event_id)) {
          return current
        }
        return {
          ...current,
          [activity.team_id]: [activity, ...list]
            .sort(byNewest)
            .slice(0, MAX_ACTIVITIES),
        }
      })
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', handleConnectError)
    socket.on('notification', handleNotification)
    socket.on('presence.snapshot', handlePresence)
    socket.on('presence.updated', handlePresence)
    socket.on('team.activity', handleTeamActivity)
    socket.connect()

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('connect_error', handleConnectError)
      socket.off('notification', handleNotification)
      socket.off('presence.snapshot', handlePresence)
      socket.off('presence.updated', handlePresence)
      socket.off('team.activity', handleTeamActivity)
      socket.disconnect()
      if (socketRef.current === socket) socketRef.current = null
    }
  }, [token, userId, onNotification, onConnect, clear])

  return { presenceByTeam, activityByTeam, status, lastError, clear }
}
