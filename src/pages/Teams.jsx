import { useState } from 'react'
import { Link } from 'react-router-dom'

import EmptyState from '../components/common/EmptyState.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import FormField from '../components/common/FormField.jsx'
import LoadingState from '../components/common/LoadingState.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import { SearchIcon } from '../components/profile/icons.jsx'
import TeamCard from '../components/teams/TeamCard.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useTeams } from '../hooks/useTeams.js'

export default function Teams() {
  const { isAuthenticated } = useAuth()
  const [search, setSearch] = useState('')
  const [term, setTerm] = useState('')
  const { teams, meta, loading, error, reload } = useTeams(term)

  function handleSubmit(event) {
    event.preventDefault()
    setTerm(search.trim())
  }

  function clearSearch() {
    setSearch('')
    setTerm('')
  }

  return (
    <div className="page container">
      <PageHeader
        eyebrow="Competitivo"
        title="Equipos"
        subtitle="Directorio de equipos competitivos públicos de CS2 Manager."
        actions={
          isAuthenticated && (
            <Link to="/teams/new" className="btn btn-primary">
              Crear equipo
            </Link>
          )
        }
      />

      <form className="players-search" onSubmit={handleSubmit} role="search">
        <FormField
          id="team-search"
          name="search"
          label="Buscar equipo"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Nombre o tag"
        />
        <button type="submit" className="btn btn-primary">
          <SearchIcon />
          Buscar
        </button>
      </form>

      {loading && (
        <LoadingState
          label="Cargando equipos…"
          detail="Estamos consultando el directorio público."
          cards={4}
        />
      )}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}
      {!loading && !error && teams.length === 0 && (
        <EmptyState
          title={term ? 'Sin resultados' : 'Directorio vacío'}
          message={
            term
              ? 'No encontramos equipos públicos con esa búsqueda.'
              : 'Todavía no hay equipos públicos.'
          }
          actionLabel={term ? 'Limpiar búsqueda' : undefined}
          onAction={term ? clearSearch : undefined}
        />
      )}
      {!loading && !error && teams.length > 0 && (
        <>
          <p className="players-count">
            {meta?.total ?? teams.length}{' '}
            {meta?.total === 1 ? 'equipo' : 'equipos'}
          </p>
          <div className="teams-grid">
            {teams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
