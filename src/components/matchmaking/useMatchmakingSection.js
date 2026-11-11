import { useEffect, useState } from 'react'

import {
  authorizeMatchmaking,
  fetchMatchmakingStatus,
  revokeMatchmaking,
  syncMatchmaking,
  uploadMatchmakingDemo,
} from '../../services/matchmaking.js'
import { getErrorMessage } from '../../utils/errors.js'
import { MATCHMAKING_ERRORS } from './matchmakingMessages.js'

/**
 * Estado y acciones de la sección de matchmaking: autorización, sincronización,
 * actualización, carga de demos y revocación.
 */
export default function useMatchmakingSection({ matchmaking, onChange }) {
  const [section, setSection] = useState(matchmaking)
  const [notice, setNotice] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [confirmRevoke, setConfirmRevoke] = useState(false)
  const [revoking, setRevoking] = useState(false)

  useEffect(() => {
    setSection(matchmaking)
  }, [matchmaking])

  function flash(variant, text) {
    setNotice({ variant, text })
  }

  async function handleAuthorize(payload) {
    const updated = await authorizeMatchmaking(payload)
    setSection(updated)
    flash('success', 'Autorización guardada. El worker buscará partidas nuevas.')
    onChange?.()
  }

  async function handleSync() {
    setSyncing(true)
    setNotice(null)
    try {
      const result = await syncMatchmaking()
      if (result.matchmaking) setSection(result.matchmaking)
      if (result.sync) {
        setSection((current) => ({
          ...current,
          sync: { ...current.sync, ...result.sync },
        }))
      }
      if (result.status === 'SKIPPED') {
        flash(
          'warning',
          result.sync?.message || 'La sincronización se hizo hace poco.',
        )
      } else {
        flash(
          'success',
          result.sync?.message || 'La sincronización quedó en cola.',
        )
      }
    } catch (error) {
      flash('error', getErrorMessage(error, MATCHMAKING_ERRORS.sync))
    } finally {
      setSyncing(false)
    }
  }

  async function handleRefresh() {
    setRefreshing(true)
    setNotice(null)
    try {
      setSection(await fetchMatchmakingStatus())
      flash('success', 'Estado actualizado.')
    } catch (error) {
      flash('error', getErrorMessage(error, MATCHMAKING_ERRORS.refresh))
    } finally {
      setRefreshing(false)
    }
  }

  async function handleUpload(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!/\.(dem|dem\.bz2)$/i.test(file.name)) {
      flash('error', 'El archivo debe ser una demo .dem o .dem.bz2.')
      return
    }

    setUploading(true)
    setNotice(null)
    try {
      await uploadMatchmakingDemo(file)
      flash(
        'success',
        'La demo se guardó. El worker la procesará y actualizará las estadísticas.',
      )
      onChange?.()
    } catch (error) {
      flash('error', getErrorMessage(error, MATCHMAKING_ERRORS.upload))
    } finally {
      setUploading(false)
    }
  }

  async function handleRevoke() {
    setRevoking(true)
    setNotice(null)
    try {
      setSection(await revokeMatchmaking())
      setConfirmRevoke(false)
      flash(
        'success',
        'Autorización revocada. Las partidas ya procesadas siguen visibles.',
      )
      onChange?.()
    } catch (error) {
      flash('error', getErrorMessage(error, MATCHMAKING_ERRORS.revoke))
    } finally {
      setRevoking(false)
    }
  }

  return {
    section,
    notice,
    syncing,
    refreshing,
    uploading,
    confirmRevoke,
    revoking,
    setConfirmRevoke,
    handleAuthorize,
    handleSync,
    handleRefresh,
    handleUpload,
    handleRevoke,
  }
}
