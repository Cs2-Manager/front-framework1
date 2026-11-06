import Badge from '../common/Badge.jsx'
import { LINEUP_STATUS_LABELS } from '../../services/grenadeLineups.js'

const TYPE_LABELS = {
  SMOKE: 'Smoke',
  FLASH: 'Flash',
  MOLOTOV: 'Molotov',
  INCENDIARY: 'Incendiaria',
  HE: 'HE',
  DECOY: 'Decoy',
}

const DIFFICULTY_LABELS = {
  EASY: 'Fácil',
  MEDIUM: 'Media',
  HARD: 'Difícil',
}

function pointLabel(point) {
  if (!Array.isArray(point) || point.length !== 2) return null
  return `(${point[0].toFixed(2)}, ${point[1].toFixed(2)})`
}

export default function GrenadeCard({
  item,
  favorite = false,
  busy = false,
  onFavorite,
  onEdit,
  onDelete,
  onPropose,
  onPublish,
  onArchive,
  onHistory,
}) {
  const media = Array.isArray(item.media) ? item.media : []
  const launch = pointLabel(item.launch_position)
  const impact = pointLabel(item.impact_position || item.position)
  const type = item.grenade_type || item.type

  return (
    <article className="grenade-card" aria-label={item.title}>
      <header className="grenade-card-head">
        <div>
          <h3>{item.title}</h3>
          <p className="grenade-card-subtitle">
            {TYPE_LABELS[type] || type} · {item.side} ·{' '}
            {DIFFICULTY_LABELS[item.difficulty] || item.difficulty}
          </p>
        </div>
        <div className="grenade-card-badges">
          <Badge variant={item.scope === 'OFFICIAL' ? 'info' : 'neutral'}>
            {item.scope === 'OFFICIAL'
              ? 'Oficial'
              : item.scope === 'TEAM'
                ? 'Equipo'
                : 'Personal'}
          </Badge>
          {item.status && (
            <Badge
              variant={
                item.status === 'PUBLISHED'
                  ? 'success'
                  : item.status === 'ARCHIVED'
                    ? 'warning'
                    : 'neutral'
              }
            >
              {LINEUP_STATUS_LABELS[item.status] || item.status}
            </Badge>
          )}
          {item.scope === 'TEAM' && (
            <Badge variant="primary">v{item.version}</Badge>
          )}
        </div>
      </header>

      {(item.launch_zone || item.impact_zone) && (
        <p className="grenade-card-zones">
          {item.launch_zone || 'Origen'} → {item.impact_zone || 'Destino'}
        </p>
      )}
      {(launch || impact) && (
        <p className="grenade-card-coordinates">
          {launch && <span>Origen {launch}</span>}
          {impact && <span>Destino {impact}</span>}
        </p>
      )}
      {item.description && (
        <p className="grenade-card-description">{item.description}</p>
      )}
      {item.instructions && (
        <p className="grenade-card-instructions">
          <strong>Ejecución:</strong> {item.instructions}
        </p>
      )}
      {item.notes && <p className="text-muted">{item.notes}</p>}
      {Array.isArray(item.tags) && item.tags.length > 0 && (
        <ul className="grenade-card-tags" aria-label="Etiquetas">
          {item.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      )}

      {media.length > 0 && (
        <div className="grenade-card-media">
          {media.map((entry) =>
            entry.kind === 'VIDEO' ? (
              <a
                key={entry.id || entry.url}
                href={entry.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver medio
              </a>
            ) : (
              <img
                key={entry.id || entry.url}
                src={entry.url}
                alt={`Demostración de ${item.title}`}
                loading="lazy"
              />
            ),
          )}
        </div>
      )}

      {item.video_url && (
        <a
          className="grenade-card-video"
          href={item.video_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Ver video
        </a>
      )}

      <p className="grenade-card-meta">
        {item.author_username && <span>Autor: {item.author_username}</span>}
        {item.team_name && <span>Equipo: {item.team_name}</span>}
        {item.responsible_id && <span>Responsable asignado</span>}
      </p>

      <footer className="grenade-card-actions">
        {onFavorite && (
          <button
            type="button"
            className="btn btn-ghost"
            disabled={busy}
            onClick={() => onFavorite(item, !favorite)}
          >
            {favorite ? 'Quitar favorito' : 'Favorito'}
          </button>
        )}
        {item.can_edit && onEdit && (
          <button type="button" className="btn btn-ghost" onClick={() => onEdit(item)}>
            Editar
          </button>
        )}
        {item.can_edit && onDelete && (
          <button
            type="button"
            className="btn btn-ghost"
            disabled={busy}
            onClick={() => onDelete(item)}
          >
            Eliminar
          </button>
        )}
        {item.can_propose && onPropose && (
          <button
            type="button"
            className="btn btn-ghost"
            disabled={busy}
            onClick={() => onPropose(item)}
          >
            Proponer al equipo
          </button>
        )}
        {item.scope === 'OFFICIAL' && item.can_edit && item.status === 'DRAFT' && onPublish && (
          <button
            type="button"
            className="btn btn-ghost"
            disabled={busy}
            onClick={() => onPublish(item)}
          >
            Publicar
          </button>
        )}
        {item.scope === 'OFFICIAL' && item.can_edit && item.status === 'PUBLISHED' && onArchive && (
          <button
            type="button"
            className="btn btn-ghost"
            disabled={busy}
            onClick={() => onArchive(item)}
          >
            Archivar
          </button>
        )}
        {item.scope === 'TEAM' && onHistory && (
          <button type="button" className="btn btn-ghost" onClick={() => onHistory(item)}>
            Historial
          </button>
        )}
      </footer>
    </article>
  )
}
