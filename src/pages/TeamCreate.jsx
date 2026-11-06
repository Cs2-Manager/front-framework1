import { Link } from 'react-router-dom'

import PageHeader from '../components/common/PageHeader.jsx'
import TeamForm from '../components/teams/TeamForm.jsx'

export default function TeamCreate() {
  return (
    <div className="page container">
      <PageHeader
        eyebrow="Equipos"
        title="Crear equipo"
        subtitle="Vas a quedar como capitán del equipo."
        actions={
          <Link to="/teams" className="btn btn-ghost">
            Volver a equipos
          </Link>
        }
      />
      <TeamForm />
    </div>
  )
}
