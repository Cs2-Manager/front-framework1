import { useCallback, useEffect, useMemo, useState } from 'react'

import Alert from '../common/Alert.jsx'
import ConfirmDialog from '../common/ConfirmDialog.jsx'
import Modal from '../common/Modal.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  DIFFICULTY_OPTIONS,
  GRENADE_TYPE_OPTIONS,
  SIDE_OPTIONS,
} from './grenadeForm.js'
import {
  SCOPE_LABELS,
  archiveGrenadeLineup,
  deleteGrenadeLineup,
  fetchGrenadeFavorites,
  fetchMapGrenadeLineups,
  fetchPersonalGrenadeLineups,
  fetchTeamGrenadeLineups,
  proposeGrenadeLineup,
  publishGrenadeLineup,
  restoreGrenadeRevision,
  setGrenadeFavorite,
} from '../../services/grenadeLineups.js'
import GrenadeCard from './GrenadeCard.jsx'
import GrenadeFormModal from './GrenadeFormModal.jsx'
import GrenadeHistoryPanel from './GrenadeHistoryPanel.jsx'
import { getErrorMessage } from '../../utils/errors.js'
import './grenadeLibrary.css'

const EMPTY_FILTERS = {
  q: '',
  type: '',
  side: '',
  difficulty: '',
  favorite: false,
}

function ProposeModal({ target, busy, onCancel, onConfirm }) {
  const [note, setNote] = useState('')

  useEffect(() => {
    setNote('')
  }, [target])

  if (!target) return null

  return (
    <Modal
      open={Boolean(target)}
      title={`Proponer “${target.title}” al equipo`}
      onClose={onCancel}
    >
      <p className="text-muted">
        Se enviará una copia inmutable de esta granada al equipo. Un capitán o
        entrenador deberá aprobarla para crear la versión compartida.
      </p>
      <label className="form-group" htmlFor="grenade-proposal-note">
        Nota para el equipo (opcional)
        <textarea
          id="grenade-proposal-note"
          value={note}
          maxLength={2000}
          onChange={(event) => setNote(event.target.value)}
        />
      </label>
      <div className="modal-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={busy}
          onClick={() => onConfirm(note)}
        >
          {busy ? 'Enviando…' : 'Enviar propuesta'}
        </button>
      </div>
    </Modal>
  )
}

function LibraryFilters({ scope, filters, onChange, isAdmin, status, onStatusChange }) {
  const change = (event) => {
    const { name, value, type, checked } = event.target
    onChange({ ...filters, [name]: type === 'checkbox' ? checked : value })
  }

  return (
    <div className="tactical-toolbar grenade-library-filters">
      <label>
        Buscar granada
        <input
          type="search"
          name="q"
          value={filters.q}
          onChange={change}
          placeholder="Nombre de la granada…"
        />
      </label>
      <label>
        Tipo
        <select name="type" value={filters.type} onChange={change}>
          <option value="">Todos</option>
          {GRENADE_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Lado
        <select name="side" value={filters.side} onChange={change}>
          <option value="">Todos</option>
          {SIDE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Dificultad
        <select name="difficulty" value={filters.difficulty} onChange={change}>
          <option value="">Todas</option>
          {DIFFICULTY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      {scope === 'OFFICIAL' && isAdmin && (
        <label>
          Estado
          <select value={status} onChange={(event) => onStatusChange(event.target.value)}>
            <option value="ALL">Todos</option>
            <option value="DRAFT">Borradores</option>
            <option value="PUBLISHED">Publicadas</option>
            <option value="ARCHIVED">Archivadas</option>
          </select>
        </label>
      )}
      <label className="grenade-favorite-filter">
        <input
          type="checkbox"
          name="favorite"
          checked={filters.favorite}
          onChange={change}
        />
        Solo favoritos
      </label>
    </div>
  )
}

export default function GrenadeLibrary({ map, team }) {
  const { user } = useAuth()
  const [scope, setScope] = useState('OFFICIAL')
  const [status, setStatus] = useState('ALL')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [items, setItems] = useState([])
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [busy, setBusy] = useState(false)
  const [formState, setFormState] = useState(null)
  const [proposalTarget, setProposalTarget] = useState(null)
  const [historyTarget, setHistoryTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const scopes = useMemo(() => {
    const available = ['OFFICIAL']
    if (user) available.push('PERSONAL')
    if (team) available.push('TEAM')
    return available
  }, [user, team])

  useEffect(() => {
    if (!scopes.includes(scope)) setScope(scopes[scopes.length - 1])
  }, [scope, scopes])

  const canCreate =
    scope === 'PERSONAL' ? Boolean(user) : scope === 'OFFICIAL' ? Boolean(user?.is_admin) : false

  const load = useCallback(async () => {
    if (!map?.id) return
    setLoading(true)
    setError('')
    try {
      const params = {
        q: filters.q,
        type: filters.type,
        side: filters.side,
        difficulty: filters.difficulty,
      }
      let result
      if (scope === 'OFFICIAL') {
        result = await fetchMapGrenadeLineups(map.id, {
          ...params,
          scope: 'OFFICIAL',
          ...(user?.is_admin ? { status } : {}),
        })
      } else if (scope === 'PERSONAL') {
        result = await fetchPersonalGrenadeLineups({ ...params, map_id: map.id })
      } else {
        result = await fetchTeamGrenadeLineups(team.id, {
          ...params,
          map_id: map.id,
          include_archived: true,
        })
      }
      setItems(result)
    } catch (err) {
      setError(getErrorMessage(err, 'No pudimos cargar las granadas.'))
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [map?.id, scope, filters, status, user?.is_admin, team?.id])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!user) {
      setFavorites([])
      return undefined
    }
    let active = true
    fetchGrenadeFavorites()
      .then((ids) => {
        if (active) setFavorites(ids)
      })
      .catch(() => {
        if (active) setFavorites([])
      })
    return () => {
      active = false
    }
  }, [user])

  async function run(action, successMessage) {
    setBusy(true)
    setError('')
    setFeedback('')
    try {
      await action()
      setFeedback(successMessage)
      await load()
      return true
    } catch (err) {
      setError(getErrorMessage(err, 'No pudimos completar la acción.'))
      return false
    } finally {
      setBusy(false)
    }
  }

  function openCreate() {
    setFormState({ lineup: null, scope })
  }

  function openEdit(lineup) {
    setFormState({ lineup, scope })
  }

  async function toggleFavorite(item, enabled) {
    setBusy(true)
    setError('')
    try {
      await setGrenadeFavorite(item.id, enabled)
      setFavorites((current) =>
        enabled
          ? Array.from(new Set([...current, item.id]))
          : current.filter((id) => id !== item.id),
      )
    } catch (err) {
      setError(getErrorMessage(err, 'No pudimos actualizar el favorito.'))
    } finally {
      setBusy(false)
    }
  }

  async function sendProposal(note) {
    const target = proposalTarget
    const saved = await run(
      () => proposeGrenadeLineup(target.id, { note }),
      'Propuesta enviada al equipo.',
    )
    if (saved) setProposalTarget(null)
  }

  async function restoreVersion(lineup, version) {
    const saved = await run(
      () =>
        restoreGrenadeRevision(lineup.id, version, {
          version: lineup.version,
        }),
      `Versión ${version} restaurada como una nueva revisión.`,
    )
    if (saved) setHistoryTarget(null)
  }

  const visibleItems = items.filter(
    (item) => !filters.favorite || favorites.includes(item.id),
  )

  const teamCanReview =
    Boolean(team) && Boolean(team.permissions?.can_manage_lineups)

  return (
    <section className="team-panel phase8-panel grenade-library">
      <h2>Biblioteca de granadas</h2>
      <p className="text-muted">
        Catálogo oficial, tus granadas privadas y las utilidades compartidas con
        tu equipo. Las granadas personales nunca son visibles para otros
        usuarios ni para administradores.
      </p>

      <nav className="map-tabs" aria-label="Alcance de las granadas">
        {scopes.map((value) => (
          <button
            key={value}
            type="button"
            className="btn btn-ghost"
            aria-pressed={scope === value}
            onClick={() => setScope(value)}
          >
            {SCOPE_LABELS[value]}
          </button>
        ))}
      </nav>

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
            {scope === 'OFFICIAL' ? 'Nueva granada oficial' : 'Nueva granada personal'}
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
          {filters.favorite
            ? 'No hay favoritos que coincidan con los filtros.'
            : scope === 'OFFICIAL'
              ? 'No hay granadas oficiales publicadas para este mapa.'
              : scope === 'PERSONAL'
                ? 'Todavía no creaste granadas personales para este mapa.'
                : 'El equipo todavía no tiene granadas aprobadas para este mapa.'}
        </p>
      )}

      <div className="grenade-grid">
        {visibleItems.map((item) => (
          <GrenadeCard
            key={item.id}
            item={item}
            favorite={favorites.includes(item.id)}
            busy={busy}
            onFavorite={user ? toggleFavorite : undefined}
            onEdit={item.can_edit ? openEdit : undefined}
            onDelete={item.can_edit ? setDeleteTarget : undefined}
            onPropose={
              item.scope === 'PERSONAL' && item.can_propose && team
                ? setProposalTarget
                : undefined
            }
            onPublish={
              item.scope === 'OFFICIAL' && user?.is_admin
                ? (lineup) =>
                    run(
                      () => publishGrenadeLineup(lineup.id),
                      'Granada oficial publicada.',
                    )
                : undefined
            }
            onArchive={
              item.scope === 'OFFICIAL' && user?.is_admin
                ? (lineup) =>
                    run(
                      () => archiveGrenadeLineup(lineup.id),
                      'Granada oficial archivada.',
                    )
                : undefined
            }
            onHistory={
              item.scope === 'TEAM' ? setHistoryTarget : undefined
            }
          />
        ))}
      </div>

      {formState && (
        <GrenadeFormModal
          open
          map={map}
          team={team}
          lineup={formState.lineup}
          scope={formState.scope}
          onClose={() => setFormState(null)}
          onSaved={() => {
            setFormState(null)
            load()
          }}
        />
      )}

      <ProposeModal
        target={proposalTarget}
        busy={busy}
        onCancel={() => setProposalTarget(null)}
        onConfirm={sendProposal}
      />

      <GrenadeHistoryPanel
        open={Boolean(historyTarget)}
        lineup={historyTarget}
        busy={busy}
        onClose={() => setHistoryTarget(null)}
        onRestore={restoreVersion}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Eliminar granada"
        message={`¿Eliminar ${deleteTarget?.title || 'esta granada'}?`}
        busy={busy}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() =>
          run(async () => {
            await deleteGrenadeLineup(deleteTarget.id)
            setDeleteTarget(null)
          }, 'Granada eliminada.')
        }
      />
    </section>
  )
}
