import { useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TacticalBoard from './TacticalBoard.jsx'
import StrategySteps from './StrategySteps.jsx'

const map = { name: 'Mirage', image_url: '/radar.png', callouts: [{ id: 1, zone_name: 'Mid', x_ratio: .2, y_ratio: .3 }] }
beforeEach(() => {
  SVGElement.prototype.createSVGPoint = () => ({ x: 0, y: 0, matrixTransform() { return { x: this.x, y: this.y } } })
  SVGElement.prototype.getScreenCTM = () => ({ inverse: () => ({}) })
  SVGElement.prototype.setPointerCapture = vi.fn()
  // jsdom has no PointerEvent; preserve coordinates for SVG interaction tests.
  window.PointerEvent = MouseEvent
})
function Editor() {
  const [elements, setElements] = useState([])
  return <><TacticalBoard map={map} elements={elements} onChange={setElements} /><output aria-label="Documento">{JSON.stringify(elements)}</output></>
}
describe('Tactical board', () => {
  it('adds normalized markers and edits them by keyboard-accessible fields', () => {
    render(<Editor />)
    fireEvent.change(screen.getByLabelText('Herramienta'), { target: { value: 'marker' } })
    fireEvent.pointerDown(screen.getByLabelText('Plano táctico de Mirage'), { clientX: 250, clientY: 750 })
    expect(JSON.parse(screen.getByLabelText('Documento').textContent)[0].points).toEqual([[.25, .75]])
    fireEvent.change(screen.getByLabelText('X 1'), { target: { value: '.6' } })
    expect(JSON.parse(screen.getByLabelText('Documento').textContent)[0].points[0][0]).toBe(.6)
    fireEvent.click(screen.getByText('Eliminar elemento'))
    expect(screen.getByLabelText('Documento').textContent).toBe('[]')
  })
  it('draws and completes an area and supports zoom/reset', () => {
    render(<Editor />)
    fireEvent.change(screen.getByLabelText('Herramienta'), { target: { value: 'area' } })
    for (const [x, y] of [[100, 100], [400, 100], [200, 400]]) fireEvent.pointerDown(screen.getByLabelText('Plano táctico de Mirage'), { clientX: x, clientY: y })
    fireEvent.click(screen.getByText('Terminar dibujo'))
    expect(JSON.parse(screen.getByLabelText('Documento').textContent)[0].kind).toBe('area')
    fireEvent.click(screen.getByLabelText('Acercar'))
    expect(screen.getByLabelText('Plano táctico de Mirage')).toHaveAttribute('viewBox', '100 100 800 800')
    fireEvent.click(screen.getByText('Mapa completo'))
    expect(screen.getByLabelText('Plano táctico de Mirage')).toHaveAttribute('viewBox', '0 0 1000 1000')
  })
  it('reads persisted coordinates and forbids drawing in read-only mode', () => {
    const onChange = vi.fn()
    render(<TacticalBoard map={map} readOnly elements={[{ id: 'one', kind: 'marker', marker: 'P1', points: [[.3, .4]], text: '' }]} onChange={onChange} />)
    expect(screen.getByRole('button', { name: 'marker P1' }).querySelector('circle')).toHaveAttribute('cx', '300')
    fireEvent.pointerDown(screen.getByLabelText('Plano táctico de Mirage'), { clientX: 200, clientY: 200 })
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.queryByRole('option', { name: 'Marcador' })).not.toBeInTheDocument()
    expect(screen.getByText('Mid')).toBeInTheDocument()
  })
  it('advances and returns through execution steps', () => {
    const onHighlight = vi.fn()
    render(<StrategySteps readOnly steps={[{ title: 'Smoke', element_ids: ['one'] }, { title: 'Entry', element_ids: ['two'] }]} onHighlight={onHighlight} />)
    fireEvent.click(screen.getByText('Siguiente'))
    expect(screen.getByText('Entry')).toBeInTheDocument()
    expect(onHighlight).toHaveBeenLastCalledWith(['two'])
    fireEvent.click(screen.getByText('Anterior'))
    expect(screen.getByText('Smoke')).toBeInTheDocument()
  })
})
