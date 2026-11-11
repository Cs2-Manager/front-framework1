import { useRealtime } from '../../context/RealtimeContext.jsx'
import useNotificationBell from '../../hooks/useNotificationBell.js'
import NotificationPanel from './NotificationPanel.jsx'
import { unreadBadge } from './notificationBellModel.js'
import { BellIcon } from './icons.jsx'

export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    status,
    lastError,
    notificationsLoading,
    notificationsError,
    hasMore,
    loadMoreNotifications,
    refreshNotifications,
    markNotificationRead,
    markAllRead,
  } = useRealtime()

  const {
    open,
    busy,
    rootRef,
    toggle,
    close,
    handleMarkAll,
    handleMarkRead,
    handleNavigate,
  } = useNotificationBell({
    unreadCount,
    markNotificationRead,
    markAllRead,
  })

  return (
    <div className="notification-bell" ref={rootRef}>
      <button
        type="button"
        className="notification-button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={
          unreadCount > 0
            ? `Notificaciones, ${unreadCount} sin leer`
            : 'Notificaciones'
        }
        onClick={toggle}
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="notification-badge" aria-hidden="true">
            {unreadBadge(unreadCount)}
          </span>
        )}
        <span
          className={`notification-status-dot notification-status-${status}`}
          aria-hidden="true"
        />
      </button>

      <NotificationPanel
        open={open}
        status={status}
        lastError={lastError}
        busy={busy}
        unreadCount={unreadCount}
        notifications={notifications}
        notificationsLoading={notificationsLoading}
        notificationsError={notificationsError}
        hasMore={hasMore}
        onClose={close}
        onMarkAll={handleMarkAll}
        onMarkRead={handleMarkRead}
        onNavigate={handleNavigate}
        onLoadMore={loadMoreNotifications}
        onRetry={refreshNotifications}
      />
    </div>
  )
}
