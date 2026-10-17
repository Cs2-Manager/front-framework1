import { useState } from 'react'

import { getErrorMessage } from '../utils/errors.js'

/**
 * Encapsula el flujo de confirmación y borrado de un recurso.
 *
 * @param {(item: any) => Promise<void>} deleteFn - petición de borrado.
 * @param {object} [options]
 * @param {string} [options.errorMessage] - mensaje por defecto si falla.
 * @param {(item: any) => void} [options.onDeleted] - callback tras borrar.
 */
export default function useDelete(deleteFn, { errorMessage, onDeleted } = {}) {
  const [pending, setPending] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function ask(item) {
    setError('')
    setPending(item)
  }

  function cancel() {
    setPending(null)
  }

  async function confirm() {
    if (!pending) return
    setBusy(true)
    setError('')
    const item = pending
    try {
      await deleteFn(item)
      setPending(null)
      onDeleted?.(item)
    } catch (err) {
      setError(getErrorMessage(err, errorMessage || 'No se pudo eliminar.'))
      setPending(null)
    } finally {
      setBusy(false)
    }
  }

  return { pending, busy, error, setError, ask, cancel, confirm }
}
