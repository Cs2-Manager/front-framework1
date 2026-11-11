import { useState } from 'react'

import {
  startFaceitOauth,
  syncFaceit,
  unlinkFaceit,
} from '../../services/faceit.js'
import { getErrorMessage } from '../../utils/errors.js'

const SYNC_ERROR = 'No pudimos sincronizar con FACEIT. Intentalo de nuevo.'
const UNLINK_ERROR =
  'No pudimos desvincular la cuenta de FACEIT. Intentalo de nuevo.'
const OAUTH_ERROR =
  'No pudimos iniciar la verificación con FACEIT Connect.'

/**
 * Acciones de la tarjeta FACEIT: sincronizar, desvincular y verificar con
 * FACEIT Connect. Mantiene el estado de cada operación y el error visible.
 */
export default function useFaceitAccountActions({ onChange } = {}) {
  const [syncing, setSyncing] = useState(false)
  const [unlinking, setUnlinking] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')
  const [syncResult, setSyncResult] = useState(null)

  async function handleSync() {
    setSyncing(true)
    setError('')
    setSyncResult(null)
    try {
      const result = await syncFaceit()
      setSyncResult(result)
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
      await unlinkFaceit()
      setConfirming(false)
      onChange?.()
    } catch (err) {
      setError(getErrorMessage(err, UNLINK_ERROR))
    } finally {
      setUnlinking(false)
    }
  }

  async function handleVerify() {
    setVerifying(true)
    setError('')
    try {
      const url = await startFaceitOauth()
      window.location.assign(url)
    } catch (err) {
      setError(getErrorMessage(err, OAUTH_ERROR))
      setVerifying(false)
    }
  }

  return {
    syncing,
    unlinking,
    verifying,
    confirming,
    setConfirming,
    error,
    syncResult,
    handleSync,
    handleUnlink,
    handleVerify,
  }
}
