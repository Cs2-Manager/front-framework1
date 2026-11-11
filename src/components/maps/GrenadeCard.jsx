import GrenadeCardActions from './GrenadeCardActions.jsx'
import GrenadeCardBadges from './GrenadeCardBadges.jsx'
import GrenadeCardContent from './GrenadeCardContent.jsx'
import GrenadeCardLocation from './GrenadeCardLocation.jsx'
import { DIFFICULTY_LABELS, TYPE_LABELS } from './grenadeCardModel.js'

export default function GrenadeCard(props) {
  const { item } = props
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
        <GrenadeCardBadges item={item} />
      </header>

      <GrenadeCardLocation item={item} />
      <GrenadeCardContent item={item} />
      <GrenadeCardActions {...props} />
    </article>
  )
}
