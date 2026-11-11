import { useCallback, useEffect, useMemo, useState } from 'react'

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
import { getErrorMessage } from '../../utils/errors.js'

const EMPTY_FILTERS = {
  q: '',
  type: '',
  side: '',
  difficulty: '',
  favorite: false,
}

export function useGrenadeLibrary({ map, team, user }) {
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

  async function publish(lineup) {
    await run(
      () => publishGrenadeLineup(lineup.id),
      'Granada oficial publicada.',
    )
  }

  async function archive(lineup) {
    await run(
      () => archiveGrenadeLineup(lineup.id),
      'Granada oficial archivada.',
    )
  }

  async function remove(lineup) {
    await run(async () => {
      await deleteGrenadeLineup(lineup.id)
      setDeleteTarget(null)
    }, 'Granada eliminada.')
  }

  const visibleItems = items.filter(
    (item) => !filters.favorite || favorites.includes(item.id),
  )

  const teamCanReview =
    Boolean(team) && Boolean(team.permissions?.can_manage_lineups)

  return {
    scope,
    setScope,
    status,
    setStatus,
    filters,
    setFilters,
    items,
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
    load,
    run,
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
  }
}
