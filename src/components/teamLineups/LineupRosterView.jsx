import Badge from '../common/Badge.jsx'
import PlayerAvatar from '../profile/PlayerAvatar.jsx'
import {
  TEAM_LINEUP_LIMITS,
  lineupPlayerName,
  lineupRoleLabel,
} from './teamLineupDisplay.js'

function roleVariant(role) {
  if (role === 'IGL') return 'primary'
  if (role === 'AWPER') return 'info'
  if (role === 'ENTRY' || role === 'LURKER') return 'danger'
  return 'neutral'
}

function PlayerSlot({ entry, index, kind }) {
  if (!entry) {
    return (
      <li className="lineup-slot empty">
        <span className="lineup-slot-empty" aria-hidden="true">
          +
        </span>
        <div className="lineup-slot-copy">
          <strong>
            {kind === 'starter' ? 'Titular' : 'Suplente'} {index + 1}
          </strong>
          <span>Vacante</span>
        </div>
      </li>
    )
  }

  return (
    <li className="lineup-slot filled">
      <PlayerAvatar profile={entry.user} size="sm" />
      <div className="lineup-slot-copy">
        <strong>{lineupPlayerName(entry)}</strong>
        {entry.competitive && <span>Nivel {entry.competitive.level ?? 'N/D'} · ELO {entry.competitive.elo ?? 'N/D'} · {entry.competitive.status}</span>}
        {entry.user?.username && (
          <span>@{entry.user.username}</span>
        )}
      </div>
      {entry.role && (
        <Badge size="sm" variant={roleVariant(entry.role)}>
          {lineupRoleLabel(entry.role)}
        </Badge>
      )}
    </li>
  )
}

function CompactRoster({ starters }) {
  if (!starters || starters.length === 0) return null

  return (
    <div className="lineup-roster-compact" aria-label="Titulares">
      {starters.slice(0, 5).map((entry) => (
        <span
          key={entry.id ?? entry.user?.id}
          className="lineup-roster-compact-avatar"
          title={`${lineupPlayerName(entry)} · ${lineupRoleLabel(entry.role)}`}
        >
          <PlayerAvatar profile={entry.user} size="xs" />
        </span>
      ))}
    </div>
  )
}

export default function LineupRosterView({ lineup, variant = 'full' }) {
  const starters = lineup?.starters || []
  const substitutes = lineup?.substitutes || []
  const starterLimit = lineup?.limits?.starters ?? TEAM_LINEUP_LIMITS.starters
  const substituteLimit =
    lineup?.limits?.substitutes ?? TEAM_LINEUP_LIMITS.substitutes

  if (variant === 'compact') {
    return <CompactRoster starters={starters} />
  }

  return (
    <div className="lineup-roster-view">
      <section className="lineup-roster-group" aria-labelledby="lineup-starters-title">
        <div className="lineup-roster-group-head">
          <h3 id="lineup-starters-title">Titulares</h3>
          <Badge
            size="sm"
            variant={starters.length >= starterLimit ? 'success' : 'warning'}
          >
            {starters.length}/{starterLimit}
          </Badge>
        </div>
        <ul className="lineup-slot-list">
          {Array.from({ length: starterLimit }, (_, index) => (
            <PlayerSlot
              key={starters[index]?.id ?? `starter-${index}`}
              entry={starters[index]}
              index={index}
              kind="starter"
            />
          ))}
        </ul>
      </section>

      <section
        className="lineup-roster-group lineup-roster-group-substitutes"
        aria-labelledby="lineup-substitutes-title"
      >
        <div className="lineup-roster-group-head">
          <h3 id="lineup-substitutes-title">Suplentes</h3>
          <Badge size="sm" variant={substitutes.length ? 'info' : 'neutral'}>
            {substitutes.length}/{substituteLimit}
          </Badge>
        </div>
        {substitutes.length === 0 ? (
          <p className="text-muted lineup-substitutes-empty">
            Sin suplentes convocados.
          </p>
        ) : (
          <ul className="lineup-slot-list lineup-slot-list-substitutes">
            {substitutes.map((entry, index) => (
              <PlayerSlot
                key={entry.id ?? entry.user?.id ?? `sub-${index}`}
                entry={entry}
                index={index}
                kind="substitute"
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
