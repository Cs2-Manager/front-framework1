/** Controles del dueño de la cuenta: sincronizar y desvincular. */
export default function SteamAccountActions({
  sync,
  syncing,
  unlinking,
  onSync,
  onUnlink,
}) {
  return (
    <div className="steam-card-actions">
      <button
        type="button"
        className="btn btn-primary"
        onClick={onSync}
        disabled={syncing || !sync.can_sync}
        title={
          sync.can_sync
            ? 'Consultar Steam y actualizar el tiempo de juego'
            : 'Esperá al intervalo mínimo entre sincronizaciones'
        }
      >
        {syncing ? (
          <>
            <span className="spinner spinner-sm" aria-hidden="true" />
            Sincronizando…
          </>
        ) : (
          'Sincronizar datos'
        )}
      </button>
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
