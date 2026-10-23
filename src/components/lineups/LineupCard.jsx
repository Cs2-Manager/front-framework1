import CardActions from '../common/CardActions.jsx'
import { youtubeEmbedUrl } from '../../utils/video.js'

export default function LineupCard({
  lineup,
  mapName,
  active,
  onSelect,
  onEdit,
  onDelete,
}) {
  const embed = youtubeEmbedUrl(lineup.video_url)
  const thumbId = embed ? embed.split('/').pop() : null

  return (
    <div
      className={`lineup-card${active ? ' active' : ''}`}
      onClick={() => onSelect(lineup)}
    >
      <div className="lineup-thumb">
        {thumbId ? (
          <img
            src={`https://img.youtube.com/vi/${thumbId}/hqdefault.jpg`}
            alt={lineup.title}
            loading="lazy"
          />
        ) : (
          <div className="lineup-thumb-fallback">{lineup.type}</div>
        )}
      </div>
      <div className="lineup-card-body">
        <div className="lineup-tags">
          <span className="tag tag-type">{lineup.type}</span>
          <span className={`tag tag-side tag-${lineup.side.toLowerCase()}`}>
            {lineup.side}
          </span>
          <span className="tag tag-map">{mapName || 'Mapa'}</span>
        </div>
        <h3 className="lineup-title">{lineup.title}</h3>
        {lineup.description && (
          <p className="lineup-desc">{lineup.description}</p>
        )}
        <CardActions
          className="lineup-actions"
          item={lineup}
          onEdit={onEdit}
          onDelete={onDelete}
          stopPropagation
        />
      </div>
    </div>
  )
}
