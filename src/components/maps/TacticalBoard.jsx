import { useRef, useState } from 'react'

export const MARKERS = ['P1', 'P2', 'P3', 'P4', 'P5', 'A', 'B', 'Mid', 'Smoke', 'Flash', 'Molotov', 'HE', 'Objective', 'Zone', 'Position']
const clamp = n => Math.min(1, Math.max(0, n))
export const normalizedPoint = (x, y) => [clamp(x / 1000), clamp(y / 1000)]

export default function TacticalBoard({ map, elements, onChange, readOnly = false, players = [], highlighted = [] }) {
  const svg = useRef(null)
  const [tool, setTool] = useState('select')
  const [marker, setMarker] = useState('P1')
  const [selected, setSelected] = useState(null)
  const [draft, setDraft] = useState([])
  const [view, setView] = useState({ x: 0, y: 0, size: 1000 })
  const drag = useRef(null)
  const item = elements.find(e => e.id === selected)
  function position(event) {
    const p = svg.current.createSVGPoint()
    p.x = event.clientX; p.y = event.clientY
    const transformed = p.matrixTransform(svg.current.getScreenCTM().inverse())
    return normalizedPoint(transformed.x, transformed.y)
  }
  function update(patch) { onChange(elements.map(e => e.id === selected ? { ...e, ...patch } : e)) }
  function add(points) {
    const element = { id: crypto.randomUUID(), kind: tool, points, text: '', ...(tool === 'marker' ? { marker } : {}) }
    onChange([...elements, element]); setSelected(element.id); setDraft([])
  }
  function down(event) {
    if (tool === 'pan') {
      drag.current = { pan: true, x: event.clientX, y: event.clientY, view }
      svg.current.setPointerCapture(event.pointerId)
      return
    }
    if (readOnly || event.target.closest('[data-element]')) return
    const p = position(event)
    if (tool === 'marker' || tool === 'text') add([p])
    else if (['line', 'arrow'].includes(tool)) {
      if (draft.length) add([draft[0], p]); else setDraft([p])
    } else if (['path', 'area'].includes(tool)) setDraft([...draft, p])
    else setSelected(null)
  }
  function move(event) {
    if (!drag.current) return
    if (drag.current.pan) {
      const d = drag.current, scale = d.view.size / svg.current.getBoundingClientRect().width
      setView({ ...d.view, x: d.view.x - (event.clientX - d.x) * scale, y: d.view.y - (event.clientY - d.y) * scale })
    } else {
      const p = position(event), d = drag.current
      onChange(elements.map(e => e.id === d.id ? { ...e, points: d.points.map(([x, y]) => [clamp(x + p[0] - d.start[0]), clamp(y + p[1] - d.start[1])]) } : e))
    }
  }
  function select(event, element) {
    if (tool === 'pan') return
    event.stopPropagation()
    setSelected(element.id)
    if (readOnly) return
    if (tool === 'erase') { onChange(elements.filter(e => e.id !== element.id)); setSelected(null); return }
    if (tool === 'select') {
      drag.current = { id: element.id, start: position(event), points: element.points }
      svg.current.setPointerCapture(event.pointerId)
    }
  }
  function zoom(factor) { setView(v => { const size = Math.max(200, Math.min(1500, v.size * factor)); return { x: v.x + (v.size - size) / 2, y: v.y + (v.size - size) / 2, size } }) }
  return <section className="tactical-board" aria-label="Tablero táctico">
    <div className="tactical-toolbar">
      <label>Herramienta<select value={tool} onChange={e => { setTool(e.target.value); setDraft([]) }}>
        {(readOnly ? ['select', 'pan'] : ['select', 'pan', 'marker', 'line', 'arrow', 'path', 'area', 'text', 'erase']).map(t => <option key={t} value={t}>{({ select: 'Seleccionar', pan: 'Desplazar', marker: 'Marcador', line: 'Línea', arrow: 'Flecha', path: 'Recorrido', area: 'Zona', text: 'Anotación', erase: 'Borrar' })[t]}</option>)}
      </select></label>
      {!readOnly && <label>Marcador<select value={marker} onChange={e => setMarker(e.target.value)}>{MARKERS.map(m => <option key={m}>{m}</option>)}</select></label>}
      <button type="button" onClick={() => zoom(.8)} aria-label="Acercar">＋</button><button type="button" onClick={() => zoom(1.25)} aria-label="Alejar">−</button>
      <button type="button" onClick={() => setView({ x: 0, y: 0, size: 1000 })}>Mapa completo</button>
      {draft.length > 0 && <><button type="button" disabled={draft.length < (tool === 'area' ? 3 : 2)} onClick={() => add(draft)}>Terminar dibujo</button><button type="button" onClick={() => setDraft([])}>Cancelar dibujo</button></>}
    </div>
    <p className="text-muted">Seleccioná una herramienta y pulsá sobre el plano. Recorridos y zonas se dibujan punto a punto. Podés editar coordenadas sin arrastrar.</p>
    <svg ref={svg} viewBox={`${view.x} ${view.y} ${view.size} ${view.size}`} onPointerDown={down} onPointerMove={move} onPointerUp={() => { drag.current = null }} onPointerCancel={() => { drag.current = null }} aria-label={`Plano táctico de ${map.name}`}>
      <defs><marker id="tactical-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#ffd075" /></marker></defs>
      <image href={map.image_url} width="1000" height="1000" preserveAspectRatio="none" />
      {(map.callouts || []).map(c => <g key={c.id} pointerEvents="none"><circle cx={c.x_ratio * 1000} cy={c.y_ratio * 1000} r="7" fill="white"/><text x={c.x_ratio * 1000 + 10} y={c.y_ratio * 1000} className="callout-label">{c.zone_name}</text></g>)}
      {elements.map(e => {
        const points = e.points.map(p => p.map(n => n * 1000).join(',')).join(' ')
        const [x, y] = e.points[0].map(n => n * 1000)
        return <g key={e.id} data-element={e.id} tabIndex="0" role="button" aria-label={`${e.kind} ${e.marker || e.text || e.id}`} onPointerDown={ev => select(ev, e)} onKeyDown={ev => { if (ev.key === 'Enter') setSelected(e.id); if (!readOnly && ev.key === 'Delete') onChange(elements.filter(v => v.id !== e.id)) }} className={selected === e.id || highlighted.includes(e.id) ? 'selected-element' : ''}>
          {e.kind === 'marker' ? <><circle cx={x} cy={y} r="22" fill="#172d4c" stroke="#ffd075" strokeWidth="3"/><text x={x} y={y + 6} textAnchor="middle" fill="white" fontSize="16">{e.marker}</text><text x={x + 26} y={y} className="callout-label">{e.text}</text></> : e.kind === 'text' ? <text x={x} y={y} className="callout-label">{e.text || 'Anotación'}</text> : e.kind === 'area' ? <polygon points={points} fill="#ffc45c44" stroke="#ffd075" strokeWidth="4" /> : <polyline points={points} fill="none" stroke="#ffd075" strokeWidth="4" markerEnd={e.kind === 'arrow' ? 'url(#tactical-arrow)' : undefined} />}
        </g>
      })}
      {draft.length > 0 && <polyline points={draft.map(p => p.map(n => n * 1000).join(',')).join(' ')} fill="none" stroke="white" strokeWidth="5" />}
    </svg>
    {item && !readOnly && <div className="tactical-inspector">
      <label>Texto del elemento<input value={item.text || ''} maxLength={500} onChange={e => update({ text: e.target.value })} /></label>
      {item.kind === 'marker' && <label>Jugador asignado<select value={item.user_id || ''} onChange={e => update({ user_id: e.target.value ? Number(e.target.value) : null })}><option value="">Sin asignar</option>{players.map(p => <option key={p.user.id} value={p.user.id}>{p.user.nickname} · {p.role || 'Sin rol'}</option>)}</select></label>}
      {item.points.map((p, index) => <div key={index} className="tactical-coordinates">{['X', 'Y'].map((axis, axisIndex) => <label key={axis}>{axis} {index + 1}<input type="number" min="0" max="1" step="any" value={p[axisIndex]} onChange={e => update({ points: item.points.map((v, i) => i === index ? v.map((n, j) => j === axisIndex ? clamp(Number(e.target.value)) : n) : v) })} /></label>)}</div>)}
      <button type="button" onClick={() => { onChange(elements.filter(e => e.id !== selected)); setSelected(null) }}>Eliminar elemento</button>
    </div>}
  </section>
}
