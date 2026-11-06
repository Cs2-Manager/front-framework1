export default function StrategyAssignments({ players, grenades, assignments, onChange, readOnly }) {
  function update(uid, patch) { onChange(assignments.map(a => a.user_id === uid ? { ...a, ...patch } : a)) }
  return <section className="team-panel"><h3>Responsabilidades de jugadores</h3>
    {players.length === 0 && <p>Seleccioná una alineación para asignar responsabilidades.</p>}
    {players.map((p, index) => {
      const assignment = assignments.find(a => a.user_id === p.user.id)
      return <fieldset disabled={readOnly} key={p.user.id}><legend>{p.user.nickname} · {p.role || 'Sin rol'}</legend>
        {!assignment ? <button type="button" onClick={() => onChange([...assignments, { user_id: p.user.id, position: [.5, .5], objective: '', responsibility: '', grenade_ids: [], order: index + 1 }])}>Asignar responsabilidad</button> : <>
          <label>Objetivo de {p.user.nickname}<input value={assignment.objective} onChange={e => update(p.user.id, { objective: e.target.value })} /></label>
          <label>Responsabilidad de {p.user.nickname}<input value={assignment.responsibility} onChange={e => update(p.user.id, { responsibility: e.target.value })} /></label>
          <label>Orden de participación<input type="number" min="1" max="5" value={assignment.order} onChange={e => update(p.user.id, { order: Number(e.target.value) })} /></label>
          <div className="tactical-coordinates">{[0, 1].map(axis => <label key={axis}>Posición {axis === 0 ? 'X' : 'Y'}<input type="number" min="0" max="1" step="0.01" value={assignment.position[axis]} onChange={e => update(p.user.id, { position: assignment.position.map((v, i) => i === axis ? Number(e.target.value) : v) })} /></label>)}</div>
          <label>Granadas asignadas<select multiple value={assignment.grenade_ids.map(String)} onChange={e => update(p.user.id, { grenade_ids: [...e.target.selectedOptions].map(o => Number(o.value)) })}>{grenades.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}</select></label>
          <button type="button" onClick={() => onChange(assignments.filter(a => a.user_id !== p.user.id))}>Quitar asignación</button>
        </>}
      </fieldset>
    })}
    {assignments.filter(a => !players.some(p => p.user.id === a.user_id)).map(a => <div key={a.user_id}>Jugador {a.user_id}: requiere reemplazo. {!readOnly && <button type="button" onClick={() => onChange(assignments.filter(v => v !== a))}>Quitar asignación obsoleta</button>}</div>)}
  </section>
}
