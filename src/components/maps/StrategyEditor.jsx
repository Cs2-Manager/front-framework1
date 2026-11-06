import { useState, useEffect } from 'react'
import api from '../../services/api.js'
import StrategyAssignments from './StrategyAssignments.jsx'
import TacticalBoard from './TacticalBoard.jsx'
import StrategySteps from './StrategySteps.jsx'
import { saveStrategy, fetchRevisions, restoreStrategy } from '../../services/tactics.js'
import Alert from '../common/Alert.jsx'
import { getErrorMessage } from '../../utils/errors.js'

export const CATEGORIES = ['Default', 'Rush', 'Execute', 'Retake', 'Hold', 'Defensive Setup', 'Aggressive Setup', 'Fake', 'Eco Strategy', 'Anti-Eco', 'Custom']
export default function StrategyEditor({ strategy, teamId, map, lineups, canEdit, onSaved, onClose }) {
  const [form, setForm] = useState(strategy || { map_id: map.id, lineup_id: null, name: '', description: '', side: 'T', category: 'Default', status: 'DRAFT', document: { schema_version: 1, elements: [], assignments: [], steps: [], notes: '' } })
  const [error, setError] = useState(''), [busy, setBusy] = useState(false), [feedback, setFeedback] = useState('')
  const [revisions, setRevisions] = useState([]), [highlighted, setHighlighted] = useState([])
  const [grenades, setGrenades] = useState([])
  useEffect(() => { api.get('/lineups', { params: { map_id: map.id } }).then(({ data }) => setGrenades(data.lineups)).catch(() => setError('No se pudieron cargar las granadas para las asignaciones.')) }, [map.id])
  const lineup = lineups.find(l => l.id === form.lineup_id)
  const doc = patch => setForm(f => ({ ...f, document: { ...f.document, ...patch } }))
  async function save(event) {
    event.preventDefault(); setBusy(true); setError(''); setFeedback('')
    try {
      const data = Object.fromEntries(['map_id', 'lineup_id', 'name', 'description', 'side', 'category', 'status', 'version', 'document'].filter(k => k in form).map(k => [k, form[k]]))
      const result = await saveStrategy(teamId, data, form.id)
      setForm(result); setFeedback(`Guardada · versión ${result.version}`); onSaved()
    } catch (e) { setError(getErrorMessage(e, 'No se pudo guardar la estrategia.')) } finally { setBusy(false) }
  }
  async function loadRevisions() { try { setRevisions(await fetchRevisions(teamId, form.id)) } catch (e) { setError(getErrorMessage(e)) } }
  async function restore(version) {
    setBusy(true)
    try { setForm(await restoreStrategy(teamId, form.id, version, form.version)); onSaved(); setFeedback('Versión recuperada como borrador.') } catch (e) { setError(getErrorMessage(e)) } finally { setBusy(false) }
  }
  return <form className="strategy-editor" onSubmit={save}>
    <div className="team-panel-head"><h2>{form.id ? form.name : 'Nueva estrategia'}</h2><button type="button" onClick={onClose}>Cerrar editor</button></div>
    <Alert>{error}</Alert><Alert variant="success">{feedback}</Alert>
    {form.needs_review?.length > 0 && <Alert variant="warning">Revisar asignaciones: jugadores {form.needs_review.join(', ')} ya no pertenecen al roster seleccionado.</Alert>}
    {form.needs_resource_review?.length > 0 && <Alert variant="warning">Granadas no disponibles: {form.needs_resource_review.join(', ')}. Actualizá las referencias de pasos y responsabilidades.</Alert>}
    <fieldset disabled={!canEdit || busy} className="strategy-fields">
      <label>Nombre de estrategia<input required maxLength={160} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
      <label>Lado<select value={form.side} onChange={e => setForm({ ...form, side: e.target.value })}><option>T</option><option>CT</option></select></label>
      <label>Categoría<select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></label>
      <label>Estado<select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{['DRAFT', 'PUBLISHED', 'ARCHIVED'].map(s => <option key={s}>{s}</option>)}</select></label>
      <label>Alineación<select value={form.lineup_id || ''} onChange={e => setForm({ ...form, lineup_id: e.target.value ? Number(e.target.value) : null })}><option value="">Sin alineación</option>{lineups.filter(l => !l.map_id || l.map_id === map.id).map(l => <option key={l.id} value={l.id}>{l.name} · {l.status}</option>)}</select></label>
      <label>Descripción<textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
    </fieldset>
    {lineup && <p>{lineup.starters.map(p => `${p.user.nickname} (${p.role || 'Sin rol'})`).join(' · ')}</p>}
    <TacticalBoard map={map} elements={form.document.elements} players={lineup?.starters || []} readOnly={!canEdit || busy} highlighted={highlighted} onChange={elements => doc({ elements, steps: form.document.steps.map(step => ({ ...step, element_ids: step.element_ids.filter(id => elements.some(e => e.id === id)) })) })} />
    <StrategyAssignments players={lineup?.starters || []} grenades={grenades} assignments={form.document.assignments} onChange={assignments => doc({ assignments })} readOnly={!canEdit || busy} />
    <StrategySteps steps={form.document.steps} players={lineup?.starters || []} elements={form.document.elements} grenades={grenades} readOnly={!canEdit || busy} onChange={steps => doc({ steps })} onHighlight={setHighlighted} />
    <label>Notas tácticas<textarea disabled={!canEdit || busy} value={form.document.notes} onChange={e => doc({ notes: e.target.value })} /></label>
    {canEdit && <button className="btn btn-primary" disabled={busy} type="submit">Guardar estrategia</button>}
    {form.id && <button type="button" onClick={loadRevisions}>Versiones anteriores</button>}
    {revisions.map(r => <div key={r.version}>Versión {r.version} · {r.created_at}{canEdit && <button type="button" disabled={busy} onClick={() => restore(r.version)}>Recuperar versión {r.version}</button>}</div>)}
  </form>
}
