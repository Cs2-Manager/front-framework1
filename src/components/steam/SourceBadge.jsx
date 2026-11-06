import Badge from '../common/Badge.jsx'

const SOURCE_LABELS = {
  VERIFIED_STEAM: 'Verificado en Steam',
  VERIFIED_FACEIT: 'Verificado en FACEIT',
  VERIFIED_DEMO: 'Verificado por demo',
  MANUAL: 'Carga manual',
  UNAVAILABLE: 'No disponible',
}

const SOURCE_VARIANTS = {
  VERIFIED_STEAM: 'success',
  VERIFIED_FACEIT: 'success',
  VERIFIED_DEMO: 'success',
  MANUAL: 'warning',
  UNAVAILABLE: 'neutral',
}

export default function SourceBadge({ source, className = '' }) {
  if (!source) return null
  return (
    <Badge
      size="sm"
      variant={SOURCE_VARIANTS[source] || 'neutral'}
      className={`steam-source-badge ${className}`.trim()}
      title={`Origen del dato: ${SOURCE_LABELS[source] || source}`}
    >
      {SOURCE_LABELS[source] || source}
    </Badge>
  )
}
