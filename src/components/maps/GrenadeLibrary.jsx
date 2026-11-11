import { useAuth } from '../../context/AuthContext.jsx'
import Alert from '../common/Alert.jsx'
import GrenadeLibraryGrid from './GrenadeLibraryGrid.jsx'
import GrenadeLibraryModals from './GrenadeLibraryModals.jsx'
import GrenadeLibraryScopes from './GrenadeLibraryScopes.jsx'
import { LibraryFilters } from './GrenadeLibraryFilters.jsx'
import { grenadeEmptyMessage } from './grenadeLibraryMessages.js'
import { useGrenadeLibrary } from './useGrenadeLibrary.js'
import './grenadeLibrary.css'

export default function GrenadeLibrary({ map, team }) {
  const { user } = useAuth()
  const {
    scope,
    setScope,
    status,
    setStatus,
    filters,
    setFilters,
    favorites,
    loading,
    error,
    feedback,
    busy,
    formState,
    setFormState,
    proposalTarget,
    setProposalTarget,
    historyTarget,
    setHistoryTarget,
    deleteTarget,
    setDeleteTarget,
    scopes,
    canCreate,
    openCreate,
    openEdit,
    toggleFavorite,
    sendProposal,
    restoreVersion,
    publish,
    archive,
    remove,
    visibleItems,
    teamCanReview,
    SCOPE_LABELS,
  } = useGrenadeLibrary({ map, team, user })

  return (
    <section className="team-panel phase8-panel grenade-library">
      <h2>Biblioteca de granadas</h2>
      <p className="text-muted">
        Catálogo oficial, tus granadas privadas y las utilidades compartidas con
        tu equipo. Las granadas personales nunca son visibles para otros
        usuarios ni para administradores.
      </p>

      <GrenadeLibraryScopes
        scopes={scopes}
        scope={scope}
        labels={SCOPE_LABELS}
        onChange={setScope}
      />

      <LibraryFilters
        scope={scope}
        filters={filters}
        onChange={setFilters}
        isAdmin={Boolean(user?.is_admin)}
        status={status}
        onStatusChange={setStatus}
      />

      <div className="grenade-library-actions">
        {canCreate && (
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            {scope === 'OFFICIAL'
              ? 'Nueva granada oficial'
              : 'Nueva granada personal'}
          </button>
        )}
        {scope === 'TEAM' && (
          <p className="text-muted">
            Las granadas de equipo nacen de propuestas personales aprobadas por
            el capitán o el entrenador.
            {!teamCanReview && ' Solo capitanes y entrenadores ven la bandeja.'}
          </p>
        )}
      </div>

      <Alert>{error}</Alert>
      <Alert variant="success">{feedback}</Alert>

      {loading && <p role="status">Cargando granadas…</p>}
      {!loading && visibleItems.length === 0 && (
        <p className="text-muted">
          {grenadeEmptyMessage({ favorite: filters.favorite, scope })}
        </p>
      )}

      <GrenadeLibraryGrid
        items={visibleItems}
        favorites={favorites}
        busy={busy}
        user={user}
        team={team}
        onToggleFavorite={toggleFavorite}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        onPropose={setProposalTarget}
        onPublish={publish}
        onArchive={archive}
        onHistory={setHistoryTarget}
      />

      <GrenadeLibraryModals
        map={map}
        team={team}
        formState={formState}
        onCloseForm={() => setFormState(null)}
        proposalTarget={proposalTarget}
        onCloseProposal={() => setProposalTarget(null)}
        onSendProposal={sendProposal}
        historyTarget={historyTarget}
        onCloseHistory={() => setHistoryTarget(null)}
        onRestore={restoreVersion}
        deleteTarget={deleteTarget}
        onCloseDelete={() => setDeleteTarget(null)}
        onDelete={remove}
        busy={busy}
      />
    </section>
  )
}
