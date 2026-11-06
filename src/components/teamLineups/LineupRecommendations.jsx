import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api.js'
import Alert from '../common/Alert.jsx'
export default function LineupRecommendations({ team, lineup }) {
  const [strategies, setStrategies] = useState([]), [selected, setSelected] = useState([]), [error, setError] = useState(''), [busy, setBusy] = useState(false), [feedback, setFeedback] = useState('')
  const available = team?.is_member || team?.permissions?.can_manage_lineups
  useEffect(() => {
    if (!available) return
    Promise.all([api.get(`/teams/${team.id}/strategies`, { params: lineup.map_id ? { map_id: lineup.map_id } : {} }), api.get(`/teams/${team.id}/lineups/${lineup.id}/recommendations`)]).then(([s, r]) => { setStrategies(s.data.strategies); setSelected(r.data.strategy_ids) }).catch(() => setError('No se pudieron cargar las recomendaciones.'))
  }, [available, team?.id, lineup.id, lineup.map_id])
  if (!available) return null
  async function save() { setBusy(true); setError(''); try { await api.put(`/teams/${team.id}/lineups/${lineup.id}/recommendations`, { strategy_ids: selected }); setFeedback('Recomendaciones guardadas.') } catch { setError('No se pudieron guardar las recomendaciones.') } finally { setBusy(false) } }
  return <section className="team-panel"><h2>Estrategias recomendadas</h2><Alert>{error}</Alert><Alert variant="success">{feedback}</Alert>
    {!strategies.length && <p>Creá estrategias desde el centro táctico del mapa.</p>}
    {strategies.map(s => <label key={s.id} style={{ display: 'block', padding: '.5rem' }}><input type="checkbox" disabled={!lineup.permissions?.can_edit || busy} checked={selected.includes(s.id)} onChange={e => setSelected(e.target.checked ? [...selected, s.id] : selected.filter(id => id !== s.id))} /> {s.name} · {s.side} <Link to={`/maps/${s.map_id}`}>Abrir mapa</Link></label>)}
    {lineup.permissions?.can_edit && <button disabled={busy} onClick={save}>Guardar recomendaciones</button>}
  </section>
}
