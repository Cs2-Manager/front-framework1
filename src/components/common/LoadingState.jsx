function SkeletonLine({ width = '100%' }) {
  return <span className="skeleton skeleton-line" style={{ width }} />
}

/**
 * Estado de carga consistente para páginas y paneles.
 * El texto visible se conserva para lectores de pantalla y tests.
 */
export default function LoadingState({
  label,
  detail,
  cards = 0,
  className = '',
}) {
  return (
    <div
      className={`loading-state ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      <span className="spinner" aria-hidden="true" />
      <div className="loading-state-copy">
        <p>{label}</p>
        {detail && <span>{detail}</span>}
      </div>
      {cards > 0 && (
        <div
          className="loading-state-cards"
          aria-hidden="true"
          data-cards={cards}
        >
          {Array.from({ length: cards }, (_, index) => (
            <span className="skeleton skeleton-card" key={index}>
              <SkeletonLine width="42%" />
              <SkeletonLine width="78%" />
              <SkeletonLine width="60%" />
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
