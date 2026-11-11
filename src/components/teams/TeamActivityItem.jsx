import { Link } from 'react-router-dom'

import { formatDateTime } from '../profile/format.js'
import { activityLabel } from './teamActivityModel.js'

/** Elemento de la actividad: tipo, fecha, descripción, autor y enlace. */
export default function TeamActivityItem({ activity }) {
  return (
    <li className="team-activity-item">
      <div className="team-activity-body">
        <div className="team-activity-head">
          <span className="team-activity-type">
            {activityLabel(activity.activity_type)}
          </span>
          <time
            className="team-activity-time"
            dateTime={activity.created_at}
          >
            {formatDateTime(activity.created_at)}
          </time>
        </div>
        <p className="team-activity-description">{activity.description}</p>
        {activity.actor?.username && (
          <span className="team-activity-actor">
            por {activity.actor.username}
          </span>
        )}
        <Link to={activity.path} className="team-activity-link">
          Ver detalle
        </Link>
      </div>
    </li>
  )
}
