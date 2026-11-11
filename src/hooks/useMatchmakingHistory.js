import { useEffect, useState } from 'react'

import {
  fetchMatchmakingMatch,
  fetchMatchmakingMatches,
} from '../services/matchmaking.js'
import { getErrorMessage } from '../utils/errors.js'
import { MATCHMAKING_ERRORS } from '../components/matchmaking/matchmakingMessages.js'

/**
 * Historial de matchmaking: lista inicial, carga completa bajo demanda y
 * detalle de una partida. El detalle remoto solo se pide al dueño del perfil.
 */
export default function useMatchmakingHistory({ matches, owner }) {
  const [items, setItems] = useState(matches)
  const [loadingAll, setLoadingAll] = useState(false)
  const [loadedAll, setLoadedAll] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')

  useEffect(() => {
    setItems(matches)
  }, [matches])

  async function handleLoadAll() {
    setLoadingAll(true)
    setError('')
    try {
      const data = await fetchMatchmakingMatches({ limit: 100 })
      setItems(data.matches || [])
      setLoadedAll(true)
    } catch (err) {
      setError(getErrorMessage(err, MATCHMAKING_ERRORS.history))
    } finally {
      setLoadingAll(false)
    }
  }

  async function handleOpen(match) {
    setSelected(match)
    setDetailOpen(true)
    setDetailError('')
    if (!owner) return

    setDetailLoading(true)
    try {
      const data = await fetchMatchmakingMatch(match.id)
      setSelected(data.match)
    } catch (err) {
      setDetailError(getErrorMessage(err, MATCHMAKING_ERRORS.detail))
    } finally {
      setDetailLoading(false)
    }
  }

  function handleCloseDetail() {
    setDetailOpen(false)
    setSelected(null)
    setDetailError('')
  }

  return {
    items,
    loadingAll,
    loadedAll,
    error,
    selected,
    detailOpen,
    detailLoading,
    detailError,
    handleLoadAll,
    handleOpen,
    handleCloseDetail,
  }
}
