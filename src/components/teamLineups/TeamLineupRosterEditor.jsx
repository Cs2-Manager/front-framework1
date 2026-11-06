import { useEffect, useState } from 'react'

import PlayerAvatar from '../profile/PlayerAvatar.jsx'
import { memberName } from '../teams/teamDisplay.js'
import {
  TEAM_LINEUP_LIMITS,
  TEAM_LINEUP_ROLE_OPTIONS,
  buildRosterPayload,
  rosterFromLineup,
  rosterRole,
  rosterSlot,
  setRosterRole,
  setRosterSlot,
} from './teamLineupDisplay.js'

function sameRoster(first, second) {
  return JSON.stringify(first) === JSON.stringify(second)
}

export default function TeamLineupRosterEditor({ team, lineup, busy, onSave }) {
  const [roster, setRoster] = useState(() => rosterFromLineup(lineup))

  useEffect(() => {
    setRoster(rosterFromLineup(lineup))
  }, [lineup])

  const canEdit = Boolean(lineup.permissions?.can_manage_players)
  const members = team?.members || []
  const starterLimit = lineup.limits?.starters ?? TEAM_LINEUP_LIMITS.starters
  const substituteLimit =
    lineup.limits?.substitutes ?? TEAM_LINEUP_LIMITS.substitutes
  const startersFull = roster.starters.length >= starterLimit
  const substitutesFull = roster.substitutes.length >= substituteLimit
  const dirty = !sameRoster(roster, rosterFromLineup(lineup))

  function handleSlot(userId, slot) {
    setRoster((previous) => setRosterSlot(previous, userId, slot))
  }

  function handleRole(userId, role) {
    setRoster((previous) => setRosterRole(previous, userId, role))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSave(buildRosterPayload(roster))
  }

  return (
    <form className="team-panel team-lineup-roster" onSubmit={handleSubmit}>
      <div className="team-panel-head">
        <h2>Alineación</h2>
        <span className="team-panel-count">
          {roster.starters.length}/{starterLimit} titulares ·{' '}
          {roster.substitutes.length}/{substituteLimit} suplentes
        </span>
      </div>

      <p className="text-muted">
        Elegí hasta {starterLimit} titulares y {substituteLimit} suplentes entre
        los integrantes del equipo. Una alineación activa debe tener exactamente{' '}
        {starterLimit} titulares.
      </p>

      {members.length === 0 ? (
        <p className="text-muted">
          El equipo todavía no tiene integrantes para convocar.
        </p>
      ) : (
        <ul className="team-lineup-roster-list">
          {members.map((member) => {
            const user = member.user
            const name = memberName(member)
            const slot = rosterSlot(roster, user.id)
            const role = rosterRole(roster, user.id)

            return (
              <li className="team-lineup-roster-row" key={member.id}>
                <div className="team-lineup-roster-identity">
                  <PlayerAvatar profile={user} size="sm" />
                  <div>
                    <strong>{name}</strong>
                    {user.username && (
                      <span className="team-member-username">
                        @{user.username}
                      </span>
                    )}
                  </div>
                </div>

                <label className="team-lineup-roster-field">
                  <span>Ubicación</span>
                  <select
                    aria-label={`Ubicación de ${name}`}
                    value={slot}
                    onChange={(event) =>
                      handleSlot(user.id, event.target.value)
                    }
                    disabled={!canEdit || busy}
                  >
                    <option value="">No convocado</option>
                    <option
                      value="starter"
                      disabled={slot !== 'starter' && startersFull}
                    >
                      Titular
                    </option>
                    <option
                      value="substitute"
                      disabled={slot !== 'substitute' && substitutesFull}
                    >
                      Suplente
                    </option>
                  </select>
                </label>

                <label className="team-lineup-roster-field">
                  <span>Rol de juego</span>
                  <select
                    aria-label={`Rol de juego de ${name}`}
                    value={role}
                    onChange={(event) =>
                      handleRole(user.id, event.target.value)
                    }
                    disabled={!canEdit || busy || !slot}
                  >
                    <option value="">Sin rol</option>
                    {TEAM_LINEUP_ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </li>
            )
          })}
        </ul>
      )}

      {canEdit && (
        <div className="team-lineup-roster-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={busy || !dirty}
          >
            Guardar alineación
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            disabled={busy || !dirty}
            onClick={() => setRoster(rosterFromLineup(lineup))}
          >
            Descartar cambios
          </button>
        </div>
      )}
    </form>
  )
}
