export default function PageHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  actions,
  children,
}) {
  return (
    <div className="page-head">
      <div>
        {children}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
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
