import { visibleActions } from './grenadeCardModel.js'

export default function GrenadeCardActions(props) {
  const actions = visibleActions(props)
  return (
    <footer className="grenade-card-actions">
      {actions.map((action) => (
        <button
          key={action.key}
          type="button"
          className="btn btn-ghost"
          disabled={action.disabled?.(props)}
          onClick={() => action.onClick(props)}
        >
          {action.label(props)}
        </button>
      ))}
    </footer>
  )
}
