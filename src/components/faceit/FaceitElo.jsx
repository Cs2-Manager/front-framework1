import { formatDateTime } from '../profile/format.js'

export default function FaceitElo({ snapshots }) {
  if (!snapshots?.length) {
    return (
      <div className="faceit-empty">
        <p>
          Todavía no hay snapshots reales de ELO. El historial comienza en la
          primera sincronización y nunca se reconstruye hacia atrás.
        </p>
      </div>
    )
  }

  const latest = snapshots[snapshots.length - 1]
  return (
    <div className="faceit-elo">
      <p className="faceit-elo-current">
        ELO actual: <strong>{latest.elo}</strong>
        {latest.skill_level != null ? ` · Nivel ${latest.skill_level}` : ''}
      </p>
      <ul className="faceit-elo-list">
        {snapshots
          .slice()
          .reverse()
          .map((snapshot) => (
            <li key={`${snapshot.captured_at}-${snapshot.elo}`}>
              <span>{formatDateTime(snapshot.captured_at)}</span>
              <strong>{snapshot.elo}</strong>
            </li>
          ))}
      </ul>
    </div>
  )
}
