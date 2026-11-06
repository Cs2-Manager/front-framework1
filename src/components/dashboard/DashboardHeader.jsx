export default function DashboardHeader({ user }) {
  const name = user?.username || 'jugador'

  return (
    <header className="dashboard-header fade-in-up">
      <div className="dashboard-header-copy">
        <p className="dashboard-eyebrow">Panel de entrenamiento</p>
        <h1>Hola, {name}</h1>
        <p className="dashboard-lead">
          Tu centro de trabajo para Counter-Strike 2: organizá mapas y callouts,
          guardá lineups de utilidades y encontrá mapas de entrenamiento de la
          Steam Workshop.
        </p>
      </div>
      <span className="dashboard-header-mark" aria-hidden="true">
        CS2
      </span>
    </header>
  )
}
