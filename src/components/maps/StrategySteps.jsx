import { useState } from 'react'
export default function StrategySteps({ steps, onChange, readOnly, onHighlight, players = [], elements = [], grenades = [] }) {
  const [index, setIndex] = useState(0)
  const current = steps[index]
  const select = n => { setIndex(n); onHighlight?.(steps[n]?.element_ids || []) }
  const update = patch => onChange(steps.map((s, i) => i === index ? { ...s, ...patch } : s))
  return <section className="team-panel"><h3>Pasos de ejecución</h3>
    <div className="tactical-toolbar"><button type="button" disabled={index === 0} onClick={() => select(index - 1)}>Anterior</button><span>{steps.length ? index + 1 : 0} / {steps.length}</span><button type="button" disabled={index >= steps.length - 1} onClick={() => select(index + 1)}>Siguiente</button>
      {!readOnly && <button type="button" onClick={() => { onChange([...steps, { title: `Paso ${steps.length + 1}`, description: '', order: steps.length + 1, actions: '', user_ids: [], element_ids: [], grenade_ids: [] }]); setIndex(steps.length) }}>Agregar paso</button>}</div>
    {!current ? <p>Sin pasos de ejecución.</p> : readOnly ? <><h4>{current.title}</h4><p>{current.description}</p><p>{current.actions}</p></> : <>
      <label>Título del paso<input value={current.title} onChange={e => update({ title: e.target.value })} /></label>
      <label>Descripción del paso<textarea value={current.description} onChange={e => update({ description: e.target.value })} /></label>
      <label>Acciones<textarea value={current.actions} onChange={e => update({ actions: e.target.value })} /></label>
      {[
        ['user_ids', 'Jugadores del paso', players.map(p => [p.user.id, p.user.nickname])],
        ['element_ids', 'Elementos del paso', elements.map(e => [e.id, e.text || e.marker || e.kind])],
        ['grenade_ids', 'Granadas del paso', grenades.map(g => [g.id, g.title])],
      ].map(([key, label, options]) => <label key={key}>{label}<select multiple value={current[key].map(String)} onChange={e => update({ [key]: [...e.target.selectedOptions].map(o => key === 'element_ids' ? o.value : Number(o.value)) })}>{options.map(([id, title]) => <option key={id} value={id}>{title}</option>)}</select></label>)}
      <button type="button" onClick={() => { onChange(steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 }))); setIndex(0) }}>Eliminar paso</button>
    </>}
  </section>
}
