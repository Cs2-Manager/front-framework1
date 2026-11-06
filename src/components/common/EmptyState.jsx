export default function EmptyState({
  message,
  actionLabel,
  onAction,
  icon,
  title,
  className = '',
}) {
  return (
    <div className={`empty-state ${className}`.trim()}>
      {icon && (
        <span className="empty-state-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      {title && <h3 className="empty-state-title">{title}</h3>}
      <p>{message}</p>
      {actionLabel && (
        <button type="button" className="btn btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}
