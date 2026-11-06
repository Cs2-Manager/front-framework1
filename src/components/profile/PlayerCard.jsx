import { Link } from 'react-router-dom'

import Badge from '../common/Badge.jsx'
import { formatInteger, formatPercent } from './format.js'
import PlayerAvatar from './PlayerAvatar.jsx'

function PlayerStats({ stats }) {
  if (!stats?.has_data) {
    return <p className="player-card-empty">Sin estadísticas registradas.</p>
  }

  return (
    <div className="player-card-stats">
      <span>
        <strong>{formatInteger(stats.matches_played)}</strong> partidas
      </span>
      <span>
        <strong>{formatPercent(stats.win_rate)}</strong> win rate
      </span>
    </div>
  )
}

export default function PlayerCard({ player }) {
  const name = player.display_name || player.nickname
  const ranked =
    player.competitive?.elo !== null && player.competitive?.elo !== undefined

  return (
    <Link to={`/players/${player.id}`} className="player-card">
      <div className="player-card-avatar">
        <PlayerAvatar profile={player} size="md" />
      </div>
      <div className="player-card-body">
        <div className="player-card-head">
          <strong className="player-card-name">{name}</strong>
          <span className="player-card-nickname">@{player.nickname}</span>
        </div>
        <div className="player-card-tags">
          {player.country && (
            <Badge size="sm">{player.country}</Badge>
          )}
          <Badge size="sm" variant={ranked ? 'primary' : 'neutral'}>
            {ranked
              ? `${formatInteger(player.competitive.elo)} ELO`
              : 'Sin clasificar'}
          </Badge>
        </div>
        <PlayerStats stats={player.stats} />
      </div>
    </Link>
  )
}
