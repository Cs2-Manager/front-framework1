import { useEffect, useState } from 'react'
import { fetchStrategies, duplicateStrategy, deleteStrategy, fetchPreparation, savePreparation } from '../../services/tactics.js'
import { fetchTeamLineups } from '../../services/teamLineups.js'
import StrategyEditor, { CATEGORIES } from './StrategyEditor.jsx'
import Alert from '../common/Alert.jsx'
import ConfirmDialog from '../common/ConfirmDialog.jsx'
import { getErrorMessage } from '../../utils/errors.js'

export default function TacticalCenter({ team, map, preparation = false }) {
  const [strategies, setStrategies] = useState([]), [lineups, setLineups] = useState([]), [setup, setSetup] = useState(null)
  const [editing, setEditing] = useState(undefined), [error, setError] = useState(''), [loading, setLoading] = useState(true), [busy, setBusy] = useState(false)
  const [query, setQuery] = useState(''), [status, setStatus] = useState(''), [pending, setPending] = useState(null), [feedback, setFeedback] = useState('')
  const [side, setSide] = useState(''), [category, setCategory] = useState('')
  const canEdit = team.permissions?.can_manage_lineups
  async function load() {
    setError('')
    try { const [s, l, p] = await Promise.all([fetchStrategies(team.id, map.id), fetchTeamLineups(team.id), fetchPreparation(team.id, map.id)]); setStrategies(s); setLineups(l.lineups); setSetup(p) }
    catch (e) { setError(getErrorMessage(e, 'No pudimos cargar la preparación del equipo.')) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [team.id, map.id])
  async function action(fn) { setBusy(true); setError(''); try { await fn(); await load(); setFeedback('Cambios guardados.') } catch (e) { setError(getErrorMessage(e)) } finally { setBusy(false) } }
  if (loading) return <p role="status">Cargando centro táctico…</p>
  return <section className="team-panel phase8-panel"><Alert>{error}</Alert><Alert variant="success">{feedback}</Alert>
    {error && <button onClick={load}>Reintentar</button>}
    {preparation && setup && <section className="preparation-form"><h2>Preparación de {map.name}</h2>
      <label>Alineación seleccionada<select disabled={!canEdit} value={setup.lineup_id || ''} onChange={e => setSetup({ ...setup, lineup_id: e.target.value ? Number(e.target.value) : null })}><option value="">Sin seleccionar</option>{lineups.filter(l => !l.map_id || l.map_id === map.id).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></label>
      <label>Preparación<select disabled={!canEdit} value={setup.readiness} onChange={e => setSetup({ ...setup, readiness: e.target.value })}><option value="NOT_STARTED">Sin preparar</option><option value="IN_PROGRESS">En preparación</option><option value="READY">Preparado</option></select></label>
      <label>Notas de preparación<textarea disabled={!canEdit} value={setup.notes} onChange={e => setSetup({ ...setup, notes: e.target.value })} /></label>
      {canEdit && <button disabled={busy} onClick={() => action(() => savePreparation(team.id, map.id, { lineup_id: setup.lineup_id, readiness: setup.readiness, notes: setup.notes, version: setup.version }))}>Guardar preparación</button>}
      <p>{map.callouts.length} callouts disponibles · {strategies.length} estrategias. Consultá las granadas en la pestaña Granadas.</p>
    </section>}
    <div className="tactical-toolbar"><label>Buscar estrategia<input value={query} onChange={e => setQuery(e.target.value)} /></label><label>Estado<select value={status} onChange={e => setStatus(e.target.value)}><option value="">Todos</option>{['DRAFT', 'PUBLISHED', 'ARCHIVED'].map(s => <option key={s}>{s}</option>)}</select></label>{canEdit && <button onClick={() => setEditing(null)}>Nueva estrategia</button>}</div>
    {!strategies.length && <p>Todavía no hay estrategias para este mapa.</p>}
    <div className="tactical-toolbar"><label>Filtrar lado<select value={side} onChange={e => setSide(e.target.value)}><option value="">Todos</option><option>T</option><option>CT</option></select></label><label>Filtrar categoría<select value={category} onChange={e => setCategory(e.target.value)}><option value="">Todas</option>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></label></div>
    <div className="team-lineups-grid">{strategies.filter(s => s.name.toLowerCase().includes(query.toLowerCase()) && (!status || s.status === status) && (!side || s.side === side) && (!category || s.category === category)).map(s => <article className="team-panel" key={s.id}><h3>{s.name}</h3><p>{s.side} · {s.category} · {s.status} · v{s.version}</p><p>{s.description}</p>{s.needs_review.length > 0 && <p>Asignaciones pendientes de revisión</p>}<button onClick={() => setEditing(s)}>Abrir estrategia</button>{canEdit && <><button disabled={busy} onClick={() => action(() => duplicateStrategy(team.id, s.id))}>Duplicar</button><button onClick={() => setPending(s)}>Eliminar</button></>}</article>)}</div>
    {editing !== undefined && <StrategyEditor key={editing?.id || 'new'} strategy={editing} teamId={team.id} map={map} lineups={lineups} canEdit={canEdit} onSaved={load} onClose={() => setEditing(undefined)} />}
    <ConfirmDialog open={Boolean(pending)} title="Eliminar estrategia" message={`¿Eliminar ${pending?.name || ''} y sus versiones?`} onCancel={() => setPending(null)} busy={busy} onConfirm={() => action(async () => { await deleteStrategy(team.id, pending.id, pending.version); setPending(null) })} />
  </section>
}
