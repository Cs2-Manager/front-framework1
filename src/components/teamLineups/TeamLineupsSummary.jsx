/** Contadores de la lista: total, activas y alineación principal. */
export default function TeamLineupsSummary({ lineups }) {
  const activeCount = lineups.filter(
    (lineup) => lineup.status === 'ACTIVE',
  ).length
  const primary = lineups.find((lineup) => lineup.is_primary)

  return (
    <div className="lineups-summary" aria-label="Resumen de alineaciones">
      <span>
        <strong>{lineups.length}</strong>{' '}
        {lineups.length === 1 ? 'alineación' : 'alineaciones'}
      </span>
      <span>
        <strong>{activeCount}</strong>{' '}
        {activeCount === 1 ? 'activa' : 'activas'}
      </span>
      <span>
        Principal: <strong>{primary?.name || 'Sin asignar'}</strong>
      </span>
    </div>
  )
}
