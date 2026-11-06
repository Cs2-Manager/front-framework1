export default function PageHeader({
  title,
  subtitle,
  eyebrow,
  actionLabel,
  onAction,
  actions,
  children,
  className = '',
}) {
  return (
    <div className={`page-head ${className}`.trim()}>
      <div className="page-head-main">
        {eyebrow && <p className="page-eyebrow">{eyebrow}</p>}
        {children}
        <h1>{title}</h1>
        {subtitle && <p className="page-head-subtitle">{subtitle}</p>}
      </div>
      {actions ??
        (actionLabel && (
          <button type="button" className="btn btn-primary" onClick={onAction}>
            {actionLabel}
          </button>
        ))}
    </div>
  )
}
