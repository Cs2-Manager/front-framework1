import { youtubeEmbedUrl } from '../../utils/video.js'

export default function LineupPlayer({ lineup }) {
  const embedUrl = lineup ? youtubeEmbedUrl(lineup.video_url) : null

  return (
    <aside className="lineup-player">
      <h3>{lineup ? 'Vista previa' : 'Reproductor'}</h3>
      {lineup ? (
        <>
          {embedUrl ? (
            <div className="video-embed">
              <iframe
                src={embedUrl}
                title={lineup.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <p className="text-muted">Video no disponible.</p>
          )}
          <p className="video-caption">{lineup.title}</p>
        </>
      ) : (
        <p className="text-muted">Seleccioná un lineup para ver el video.</p>
      )}
    </aside>
  )
}
