function GrenadeCardText({ item }) {
  return (
    <>
      {item.description && (
        <p className="grenade-card-description">{item.description}</p>
      )}
      {item.instructions && (
        <p className="grenade-card-instructions">
          <strong>Ejecución:</strong> {item.instructions}
        </p>
      )}
      {item.notes && <p className="text-muted">{item.notes}</p>}
    </>
  )
}

function GrenadeCardTags({ tags }) {
  return (
    <ul className="grenade-card-tags" aria-label="Etiquetas">
      {tags.map((tag) => (
        <li key={tag}>{tag}</li>
      ))}
    </ul>
  )
}

function GrenadeCardMedia({ item, media }) {
  return (
    <>
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
    </>
  )
}

function GrenadeCardMeta({ item }) {
  return (
    <p className="grenade-card-meta">
      {item.author_username && <span>Autor: {item.author_username}</span>}
      {item.team_name && <span>Equipo: {item.team_name}</span>}
      {item.responsible_id && <span>Responsable asignado</span>}
    </p>
  )
}

export default function GrenadeCardContent({ item }) {
  const media = Array.isArray(item.media) ? item.media : []
  const tags = Array.isArray(item.tags) ? item.tags : []
  return (
    <>
      <GrenadeCardText item={item} />
      {tags.length > 0 && <GrenadeCardTags tags={tags} />}
      <GrenadeCardMedia item={item} media={media} />
      <GrenadeCardMeta item={item} />
    </>
  )
}
