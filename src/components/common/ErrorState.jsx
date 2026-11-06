import Alert from './Alert.jsx'

/**
 * Error recuperable con acción de reintento y acciones adicionales opcionales.
 */
export default function ErrorState({
  message,
  onRetry,
  retryLabel = 'Reintentar',
  children,
  label = 'Error',
}) {
  return (
    <div className="error-state" role="group" aria-label={label}>
      <Alert>{message}</Alert>
      {(onRetry || children) && (
        <div className="error-state-actions">
          {onRetry && (
            <button type="button" className="btn btn-ghost" onClick={onRetry}>
              {retryLabel}
            </button>
          )}
          {children}
        </div>
      )}
    </div>
  )
}
