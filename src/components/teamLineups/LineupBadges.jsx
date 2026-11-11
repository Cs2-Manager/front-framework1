import Badge from '../common/Badge.jsx'
import { lineupStatusLabel } from './teamLineupDisplay.js'

export default function LineupBadges({ lineup }) {
  return (
    <div className="team-lineup-badges">
      <Badge variant={lineup.status === 'ACTIVE' ? 'success' : 'neutral'}>
        {lineupStatusLabel(lineup.status)}
      </Badge>
      {lineup.is_primary && <Badge variant="primary">Principal</Badge>}
      {lineup.is_complete ? (
        <Badge variant="info">Completa</Badge>
      ) : (
        <Badge variant="warning">Incompleta</Badge>
      )}
    </div>
  )
}
