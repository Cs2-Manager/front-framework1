import Badge from '../common/Badge.jsx'
import { scopeBadge, statusLabel, statusVariant } from './grenadeCardModel.js'

export default function GrenadeCardBadges({ item }) {
  const scope = scopeBadge(item.scope)
  return (
    <div className="grenade-card-badges">
      <Badge variant={scope.variant}>{scope.label}</Badge>
      {item.status && (
        <Badge variant={statusVariant(item.status)}>
          {statusLabel(item.status)}
        </Badge>
      )}
      {item.scope === 'TEAM' && <Badge variant="primary">v{item.version}</Badge>}
    </div>
  )
}
