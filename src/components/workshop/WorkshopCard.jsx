import CardActions from '../common/CardActions.jsx'

export default function WorkshopCard({ workshopMap, onEdit, onDelete }) {
  return (
    <article className="workshop-card">
      <div className="workshop-card-img">
        {workshopMap.image_url ? (
          <img
            src={workshopMap.image_url}
            alt={workshopMap.title}
            loading="lazy"
          />
        ) : (
          <div className="map-card-fallback">{workshopMap.title}</div>
        )}
        <span className="workshop-card-category">{workshopMap.category}</span>
      </div>
      <div className="workshop-card-body">
        <h3 className="workshop-card-title">{workshopMap.title}</h3>
        {workshopMap.description && (
          <p className="workshop-card-desc">{workshopMap.description}</p>
        )}
        <CardActions
          className="workshop-card-actions"
          item={workshopMap}
          onEdit={onEdit}
          onDelete={onDelete}
        >
          <a
            className="btn btn-primary btn-sm"
            href={workshopMap.workshop_url}
            target="_blank"
            rel="noreferrer"
          >
            Ver en Workshop ↗
          </a>
        </CardActions>
      </div>
    </article>
  )
}
