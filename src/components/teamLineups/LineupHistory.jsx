import { useEffect, useState } from 'react'
import api from '../../services/api.js'
import Alert from '../common/Alert.jsx'
export default function LineupHistory({ teamId, lineupId, updatedAt }) {
  const [history, setHistory] = useState(null), [error, setError] = useState('')
  useEffect(() => {
    let active = true
    api.get(`/teams/${teamId}/lineups/${lineupId ? `${lineupId}/` : ''}history`).then(({ data }) => { if (active) setHistory(data.history) }).catch(() => { if (active) setError('No se pudo cargar el historial.') })
    return () => { active = false }
  }, [teamId, lineupId, updatedAt])
  return <section className="team-panel"><h2>Historial de alineaciones</h2><Alert>{error}</Alert>
    {!history && !error && <p>Cargando historial…</p>}
    {history?.length === 0 && <p>Sin modificaciones registradas.</p>}
    {history?.map(h => <details key={h.id}><summary>{h.action} · {h.after?.name || h.before?.name} · {new Date(h.created_at).toLocaleString()} · Usuario {h.actor_id || 'Sistema'}</summary>
      <div className="team-lineups-grid">{['before', 'after'].map(key => <div key={key}><h3>{key === 'before' ? 'Antes' : 'Después'}</h3>{h[key] ? <><p>{h[key].name} · {h[key].status} · Mapa {h[key].map_id || 'General'}</p><p>{h[key].description}</p><p>{h[key].notes}</p><ul>{h[key].players.map(p => <li key={p.user_id}>Jugador {p.user_id}: {p.role || 'Sin rol'} · {p.is_starter ? 'Titular' : 'Suplente'}</li>)}</ul></> : <p>Sin alineación</p>}</div>)}</div>
    </details>)}
  </section>
}
