import TeamActivityItem from './TeamActivityItem.jsx'
import useTeamActivityFeed from '../../hooks/useTeamActivityFeed.js'

export default function TeamActivityFeed({ teamId, isMember = false }) {
  const { activities, total, loading, error, hasMore, page, load } =
    useTeamActivityFeed({ teamId, isMember })

  if (!isMember) return null

  return (
    <section className="team-panel" aria-labelledby="team-activity-title">
      <div className="team-panel-head">
        <h2 id="team-activity-title">Actividad</h2>
        <span className="team-panel-count">{total}</span>
      </div>

      {error && (
        <div className="team-activity-error" role="alert">
          <span>{error}</span>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => load({ nextPage: 1 })}
          >
            Reintentar
          </button>
        </div>
      )}

      {!error && activities.length === 0 && loading && (
        <p className="text-muted">Cargando actividad…</p>
      )}

      {!error && activities.length === 0 && !loading && (
        <p className="text-muted">
          Todavía no hay actividad registrada en este equipo.
        </p>
      )}

      {activities.length > 0 && (
        <ul className="team-activity-list" aria-busy={loading}>
          {activities.map((activity) => (
            <TeamActivityItem key={activity.event_id} activity={activity} />
          ))}
        </ul>
      )}

      {hasMore && !loading && (
        <button
          type="button"
          className="btn btn-sm btn-ghost team-activity-more"
          onClick={() => load({ nextPage: page + 1, append: true })}
        >
          Ver más actividad
        </button>
      )}
    </section>
  )
}
