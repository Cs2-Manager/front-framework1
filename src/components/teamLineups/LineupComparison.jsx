import { useState } from 'react'
import api from '../../services/api.js'
import LineupRosterView from './LineupRosterView.jsx'
import Alert from '../common/Alert.jsx'
import MapStatistics from '../maps/MapStatistics.jsx'
export default function LineupComparison({ teamId, lineups }) {
  const [left, setLeft] = useState(''), [right, setRight] = useState(''), [result, setResult] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState(false)
  async function compare() {
    setBusy(true); setError(''); setResult(null)
    try { setResult((await api.get(`/teams/${teamId}/lineups/${left}/compare/${right}`)).data) } catch { setError('No se pudieron comparar las alineaciones.') } finally { setBusy(false) }
  }
  if (lineups.length < 2) return null
  return <section className="team-panel"><h2>Comparar alineaciones</h2><div className="tactical-toolbar">
    {[['Primera alineación', left, setLeft], ['Segunda alineación', right, setRight]].map(([label, value, setter]) => <label key={label}>{label}<select value={value} onChange={e => setter(e.target.value)}><option value="">Seleccionar</option>{lineups.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></label>)}
    <button disabled={!left || !right || left === right || busy} onClick={compare}>Comparar</button></div><Alert>{error}</Alert>
    {busy && <p>Cargando comparación…</p>}
    {result?.average_elo && <p>ELO promedio registrado en perfiles: {result.average_elo.first?.value ?? 'No disponible'} ({result.average_elo.first?.sample || 0} jugadores) / {result.average_elo.second?.value ?? 'No disponible'} ({result.average_elo.second?.sample || 0} jugadores).</p>}
    {result && <div className="team-lineups-grid">{[result.first, result.second].filter(l => l.map_id).map(l => <section key={l.id}><h3>Rendimiento por mapa · {l.name} · {l.map_name}</h3><MapStatistics team={{ id: teamId }} map={{ id: l.map_id }} playerIds={[...l.starters, ...l.substitutes].map(p => p.user.id)} /></section>)}</div>}
    {result && <><p>Agregados: {result.added.join(', ') || 'Ninguno'} · Eliminados: {result.removed.join(', ') || 'Ninguno'} · Cambios de rol/titularidad: {result.changed.join(', ') || 'Ninguno'}</p><div className="team-lineups-grid">{[result.first, result.second].map(l => <div key={l.id}><h3>{l.name} · {l.map_name || 'General'}</h3><LineupRosterView lineup={l} /></div>)}</div><p>El ELO individual no representa la fuerza colectiva. Rendimiento colectivo: no disponible.</p></>}
  </section>
}
