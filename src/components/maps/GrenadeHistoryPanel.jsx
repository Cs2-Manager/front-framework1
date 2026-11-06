import { useEffect, useState } from 'react'

import Alert from '../common/Alert.jsx'
import Modal from '../common/Modal.jsx'
import { fetchGrenadeRevisions } from '../../services/grenadeLineups.js'
import { formatDateTime } from '../profile/format.js'
import { getErrorMessage } from '../../utils/errors.js'

const ACTION_LABELS = {
  CREATE: 'Creada',
  UPDATE: 'Editada',
  RESTORE: 'Restaurada',
  PUBLISH: 'Publicada',
  ARCHIVE: 'Archivada',
  APPROVED: 'Aprobada',
}

export default function GrenadeHistoryPanel({
  open,
  lineup,
  busy = false,
  onClose,
  onRestore,
}) {
  const [revisions, setRevisions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !lineup) return undefined
    let active = true
    setLoading(true)
    setError('')
    fetchGrenadeRevisions(lineup.id)
      .then((data) => {
        if (active) setRevisions(data.revisions || [])
      })
      .catch((err) => {
        if (active) {
          setError(
            getErrorMessage(err, 'No pudimos cargar el historial de la granada.'),
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [open, lineup])

  if (!open) return null

  return (
    <Modal open={open} title={`Historial · ${lineup?.title || ''}`} onClose={onClose}>
      <Alert>{error}</Alert>
      {loading && <p role="status">Cargando historial…</p>}
      {!loading && revisions.length === 0 && (
        <p className="text-muted">Todavía no hay revisiones registradas.</p>
      )}
      <ol className="grenade-history">
        {revisions.map((revision) => (
          <li key={revision.id} className="grenade-history-item">
            <div className="grenade-history-head">
              <strong>Versión {revision.version}</strong>
              <span className="badge">
                {ACTION_LABELS[revision.action] || revision.action}
              </span>
            </div>
            <p className="text-muted">
              {formatDateTime(revision.created_at)}
              {revision.actor_username ? ` · ${revision.actor_username}` : ''}
            </p>
            {revision.change_summary && <p>{revision.change_summary}</p>}
            {revision.snapshot?.title && (
              <p className="grenade-history-snapshot">
                Título guardado: {revision.snapshot.title}
              </p>
            )}
            <button
              type="button"
              className="btn btn-ghost"
              disabled={busy || revision.version === lineup?.version}
              onClick={() => onRestore?.(lineup, revision.version)}
            >
              Restaurar versión {revision.version}
            </button>
          </li>
        ))}
      </ol>
      <div className="modal-actions">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </Modal>
  )
}
