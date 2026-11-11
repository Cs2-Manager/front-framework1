import { useState } from 'react'

import { discoverFaceit, linkFaceit, startFaceitOauth } from '../../services/faceit.js'
import { getErrorMessage } from '../../utils/errors.js'

/** Owns discovery/link/OAuth requests; the card only renders their state. */
export default function useFaceitDiscovery(onChange) {
  const [discovering, setDiscovering] = useState(false)
  const [linking, setLinking] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const [discovery, setDiscovery] = useState(null)
  const [error, setError] = useState('')

  async function handleDiscover() {
    setDiscovering(true)
    setError('')
    setDiscovery(null)
    try {
      setDiscovery(await discoverFaceit())
    } catch (err) {
      setError(getErrorMessage(err, 'No pudimos consultar FACEIT. Intentalo de nuevo.'))
    } finally {
      setDiscovering(false)
    }
  }

  async function handleLink() {
    setLinking(true)
    setError('')
    try {
      await linkFaceit(discovery?.player?.player_id)
      setDiscovery(null)
      onChange?.()
    } catch (err) {
      setError(getErrorMessage(err, 'No pudimos vincular la cuenta de FACEIT. Intentalo de nuevo.'))
    } finally {
      setLinking(false)
    }
  }

  async function handleOauth() {
    setRedirecting(true)
    setError('')
    try {
      const url = await startFaceitOauth()
      window.location.assign(url)
    } catch (err) {
      setError(getErrorMessage(err, 'No pudimos iniciar la vinculación con FACEIT Connect.'))
      setRedirecting(false)
    }
  }

  return {
    discovering, linking, redirecting, discovery, error,
    handleDiscover, handleLink, handleOauth,
  }
}
