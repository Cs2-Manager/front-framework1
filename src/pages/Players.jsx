import { useState } from 'react'

import EmptyState from '../components/common/EmptyState.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import FormField from '../components/common/FormField.jsx'
import LoadingState from '../components/common/LoadingState.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import PlayerCard from '../components/profile/PlayerCard.jsx'
import { SearchIcon } from '../components/profile/icons.jsx'
import { usePlayers } from '../hooks/useProfile.js'

function PlayersGrid({ players }) {
  return (
    <div className="players-grid">
      {players.map((player) => (
        <PlayerCard key={player.id} player={player} />
      ))}
    </div>
  )
}

export default function Players() {
  const [search, setSearch] = useState('')
  const [term, setTerm] = useState('')
  const { players, meta, loading, error, reload } = usePlayers(term)

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
        eyebrow="Comunidad"
        title="Jugadores"
        subtitle="Perfiles competitivos públicos de la comunidad de CS2 Manager."
      />

      <form className="players-search" onSubmit={handleSubmit} role="search">
        <FormField
          id="player-search"
          name="search"
          label="Buscar jugador"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Nickname o nombre visible"
        />
        <button type="submit" className="btn btn-primary">
          <SearchIcon />
          Buscar
        </button>
      </form>

      {loading && (
        <LoadingState
          label="Cargando jugadores…"
          detail="Estamos consultando los perfiles públicos."
          cards={4}
        />
      )}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}
      {!loading && !error && players.length === 0 && (
        <EmptyState
          title={term ? 'Sin resultados' : 'Directorio vacío'}
          message={
            term
              ? 'No encontramos jugadores públicos con esa búsqueda.'
              : 'Todavía no hay jugadores con perfil público.'
          }
          actionLabel={term ? 'Limpiar búsqueda' : undefined}
          onAction={term ? clearSearch : undefined}
        />
      )}
      {!loading && !error && players.length > 0 && (
        <>
          <p className="players-count">
            {meta?.total ?? players.length}{' '}
            {meta?.total === 1 ? 'jugador' : 'jugadores'}
          </p>
          <PlayersGrid players={players} />
        </>
      )}
    </div>
  )
}
