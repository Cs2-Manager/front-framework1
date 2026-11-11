import TeamLineupCard from './TeamLineupCard.jsx'

/** Tarjetas de alineaciones con sus acciones permitidas por el backend. */
export default function TeamLineupsGrid({
  teamId,
  lineups,
  busy,
  onActivate,
  onDeactivate,
  onPrimary,
  onDelete,
}) {
  return (
    <div className="team-lineups-grid">
      {lineups.map((lineup) => (
        <TeamLineupCard
          key={lineup.id}
          teamId={teamId}
          lineup={lineup}
          busy={busy}
          onActivate={onActivate}
          onDeactivate={onDeactivate}
          onPrimary={onPrimary}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
