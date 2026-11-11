import NotificationItem from './NotificationItem.jsx'
import {
  OFFLINE_FALLBACK,
  STATUS_LABELS,
  isConnectionWarning,
} from './notificationBellModel.js'

/**
 * Panel desplegable: estado de conexión, error de historial, lista con
 * paginación y acciones de lectura.
 */
export default function NotificationPanel({
  open,
  status,
  lastError,
  busy,
  unreadCount,
  notifications,
  notificationsLoading,
  notificationsError,
  hasMore,
  onClose,
  onMarkAll,
  onMarkRead,
  onNavigate,
  onLoadMore,
  onRetry,
}) {
  return (
    <div
      className={`notification-panel ${open ? 'open' : ''}`}
      role="dialog"
      aria-label="Notificaciones"
      aria-hidden={!open}
    >
      <div className="notification-panel-header">
        <div className="notification-panel-heading">
          <strong>Notificaciones</strong>
          <span className={`notification-connection notification-${status}`}>
            {STATUS_LABELS[status] || status}
          </span>
        </div>
        <div className="notification-panel-actions">
          <button
            type="button"
            className="notification-action"
            disabled={busy || unreadCount === 0}
            onClick={onMarkAll}
          >
            Marcar todas como leídas
          </button>
          <button
            type="button"
            className="notification-close"
            aria-label="Cerrar notificaciones"
            onClick={onClose}
          >
            ×
          </button>
        </div>
      </div>

      {isConnectionWarning(status) && (
        <p className="notification-warning" role="status">
          {lastError || OFFLINE_FALLBACK}
        </p>
      )}

      {notificationsError && (
        <div className="notification-error-state" role="alert">
          <span>{notificationsError}</span>
          <button
            type="button"
            className="notification-action"
            onClick={onRetry}
          >
            Reintentar
          </button>
        </div>
      )}

      <div className="notification-list" aria-busy={notificationsLoading}>
        {notifications.length === 0 && notificationsLoading ? (
          <p className="notification-empty">Cargando notificaciones…</p>
        ) : notifications.length === 0 ? (
          <p className="notification-empty">No hay notificaciones.</p>
        ) : (
          <ul className="notification-items">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.event_id}
                notification={notification}
                busy={busy}
                onNavigate={onNavigate}
                onMarkRead={onMarkRead}
              />
            ))}
          </ul>
        )}

        {notificationsLoading && notifications.length > 0 && (
          <p className="notification-loading-more" role="status">
            Cargando más…
          </p>
        )}

        {hasMore && !notificationsLoading && (
          <button
            type="button"
            className="notification-load-more"
            onClick={onLoadMore}
          >
            Ver más
          </button>
        )}
      </div>
    </div>
  )
}
