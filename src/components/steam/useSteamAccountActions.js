import { useState } from 'react'

import { syncSteam, unlinkSteam } from '../../services/steam.js'
import { getErrorMessage } from '../../utils/errors.js'

const SYNC_ERROR =
  'No pudimos sincronizar con Steam. Intentalo de nuevo.'
const UNLINK_ERROR =
  'No pudimos desvincular la cuenta de Steam. Intentalo de nuevo.'

/**
 * Acciones de la tarjeta Steam: sincronización manual y desvinculación con
 * confirmación. Expone el estado de cada operación y el error visible.
 */
export default function useSteamAccountActions({ onChange } = {}) {
  const [syncing, setSyncing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [unlinking, setUnlinking] = useState(false)
  const [error, setError] = useState('')
  const [syncResult, setSyncResult] = useState(null)

  async function handleSync() {
    setSyncing(true)
    setError('')
    setSyncResult(null)
    try {
      const result = await syncSteam()
      setSyncResult(result.sync)
      onChange?.()
    } catch (err) {
      setError(getErrorMessage(err, SYNC_ERROR))
    } finally {
      setSyncing(false)
    }
  }

  async function handleUnlink() {
    setUnlinking(true)
    setError('')
    try {
      await unlinkSteam()
      setConfirming(false)
      onChange?.()
    } catch (err) {
      setError(getErrorMessage(err, UNLINK_ERROR))
    } finally {
      setUnlinking(false)
    }
  }

  return {
    syncing,
    confirming,
    setConfirming,
    unlinking,
    error,
    syncResult,
    handleSync,
    handleUnlink,
  }
}
