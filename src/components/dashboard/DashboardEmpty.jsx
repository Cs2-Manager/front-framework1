import { Link } from 'react-router-dom'

import { MapIcon } from './icons.jsx'

export default function DashboardEmpty() {
  return (
    <section className="dashboard-empty" aria-labelledby="dashboard-empty-title">
      <span className="dashboard-empty-icon" aria-hidden="true">
        <MapIcon size={28} />
      </span>
      <h2 id="dashboard-empty-title">Tu espacio de entrenamiento está vacío</h2>
      <p>
        Empezá creando un mapa y sus callouts. Después vas a poder asociarle
        lineups de utilidades y sumar mapas de entrenamiento de la Workshop.
      </p>
      <div className="dashboard-empty-actions">
        <Link to="/maps" className="btn btn-primary">
          Crear el primer mapa
        </Link>
        <Link to="/workshop" className="btn btn-ghost">
          Explorar Workshop
        </Link>
      </div>
    </section>
  )
}
