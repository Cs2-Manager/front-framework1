import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Estado del panel de notificaciones: apertura, cierre por ruta, click fuera
 * y Escape, además de las acciones de lectura con bloqueo mientras se envía.
 */
export default function useNotificationBell({
  unreadCount,
  markNotificationRead,
  markAllRead,
}) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const rootRef = useRef(null)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!open) return undefined

    function handleClickOutside(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  async function handleMarkAll() {
    if (busy || unreadCount === 0) return
    setBusy(true)
    try {
      await markAllRead()
    } finally {
      setBusy(false)
    }
  }

  async function handleMarkRead(notification) {
    if (busy) return
    setBusy(true)
    try {
      await markNotificationRead(notification)
    } finally {
      setBusy(false)
    }
  }

  function handleNavigate(notification) {
    if (!notification.read) void handleMarkRead(notification)
    setOpen(false)
  }

  function toggle() {
    setOpen((value) => !value)
  }

  return {
    open,
    busy,
    rootRef,
    toggle,
    close: () => setOpen(false),
    handleMarkAll,
    handleMarkRead,
    handleNavigate,
  }
}
