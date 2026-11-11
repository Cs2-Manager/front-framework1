import { Link } from 'react-router-dom'

import { formatDateTime } from '../profile/format.js'
import { TYPE_LABELS } from './notificationBellModel.js'

/** Elemento de la lista: enlace al recurso interno y acción de marcar leída. */
export default function NotificationItem({
  notification,
  busy,
  onNavigate,
  onMarkRead,
}) {
  const type = notification.resource.type
  return (
    <li className={`notification-item ${notification.read ? '' : 'unread'}`}>
      <Link
        to={notification.resource.path}
        className="notification-link"
        onClick={() => onNavigate(notification)}
      >
        <span className="notification-item-head">
          <span className={`notification-type notification-type-${type}`}>
            {TYPE_LABELS[type] || 'Aviso'}
          </span>
          {!notification.read && (
            <span className="notification-unread-dot" aria-label="Sin leer" />
          )}
        </span>
        <strong className="notification-title">{notification.title}</strong>
        <span className="notification-message">{notification.message}</span>
        <time className="notification-time" dateTime={notification.created_at}>
          {formatDateTime(notification.created_at)}
        </time>
      </Link>
      {!notification.read && (
        <button
          type="button"
          className="notification-mark-read"
          disabled={busy}
          onClick={() => onMarkRead(notification)}
        >
          Marcar leída
        </button>
      )}
    </li>
  )
}
