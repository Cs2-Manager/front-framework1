/**
 * Controles del dueño de la cuenta: sincronizar, verificar con FACEIT Connect
 * (solo si aún no está verificada) y desvincular con confirmación.
 */
export default function FaceitAccountActions({
  sync,
  account,
  syncing,
  verifying,
  unlinking,
  onSync,
  onVerify,
  onUnlink,
}) {
  return (
    <div className="faceit-card-actions">
      <button
        type="button"
        className="btn btn-primary"
        onClick={onSync}
        disabled={syncing || !sync.can_sync}
        title={
          sync.can_sync
            ? 'Consultar FACEIT y actualizar estadísticas e historial'
            : 'Esperá al intervalo mínimo entre sincronizaciones'
        }
      >
        {syncing ? (
          <>
            <span className="spinner spinner-sm" aria-hidden="true" />
            Sincronizando…
          </>
        ) : (
          'Sincronizar FACEIT'
        )}
      </button>
      {!account.verified && sync.oauth_configured ? (
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onVerify}
          disabled={verifying}
        >
          {verifying ? 'Redirigiendo…' : 'Verificar con FACEIT Connect'}
        </button>
      ) : null}
      <button
        type="button"
        className="btn btn-danger"
        onClick={onUnlink}
        disabled={unlinking}
      >
        Desvincular
      </button>
    </div>
  )
}
