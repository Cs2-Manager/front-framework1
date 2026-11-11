/**
 * Controles del dueño sobre la autorización de matchmaking: sincronizar,
 * actualizar estado, subir una demo y revocar la autorización.
 */
export default function MatchmakingActions({
  syncing,
  refreshing,
  uploading,
  revoking,
  disabled,
  sync,
  onSync,
  onRefresh,
  onUpload,
  onRevoke,
}) {
  return (
    <div className="mm-actions">
      <button
        type="button"
        className="btn btn-primary"
        onClick={onSync}
        disabled={syncing || !sync.can_sync || disabled}
        title={
          sync.can_sync
            ? 'Pedir al worker que busque share codes nuevos'
            : 'Esperá al intervalo mínimo entre sincronizaciones'
        }
      >
        {syncing ? (
          <>
            <span className="spinner spinner-sm" aria-hidden="true" />
            Enviando…
          </>
        ) : (
          'Sincronizar ahora'
        )}
      </button>
      <button
        type="button"
        className="btn btn-ghost"
        onClick={onRefresh}
        disabled={refreshing}
      >
        {refreshing ? 'Actualizando…' : 'Actualizar estado'}
      </button>
      <label className="btn btn-ghost mm-upload">
        <input
          type="file"
          accept=".dem,.dem.bz2,.bz2"
          aria-label="Demo de matchmaking"
          className="mm-file-input"
          onChange={onUpload}
          disabled={uploading || disabled}
        />
        {uploading ? 'Subiendo…' : 'Subir demo'}
      </label>
      <button
        type="button"
        className="btn btn-danger"
        onClick={onRevoke}
        disabled={revoking}
      >
        Revocar autorización
      </button>
    </div>
  )
}
