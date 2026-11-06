import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import GrenadeEditor from './GrenadeEditor.jsx'

const map = { id: 1, name: 'Mirage', image_url: 'https://cdn.example.com/mirage.png' }

describe('GrenadeEditor', () => {
  it('renders origin and impact markers from normalized coordinates', () => {
    render(
      <GrenadeEditor
        map={map}
        value={{ launch_position: [0.25, 0.5], impact_position: [0.75, 0.8] }}
        onChange={() => {}}
      />,
    )

    expect(screen.getByLabelText('Marcador de origen')).toHaveStyle({
      left: '25%',
      top: '50%',
    })
    expect(screen.getByLabelText('Marcador de destino')).toHaveStyle({
      left: '75%',
      top: '80%',
    })
    expect(screen.getByAltText('Plano táctico de Mirage')).toHaveAttribute(
      'src',
      map.image_url,
    )
  })

  it('moves the selected marker with the keyboard and clamps to the map', () => {
    const onChange = vi.fn()
    render(
      <GrenadeEditor
        map={map}
        value={{ launch_position: [0.99, 0.01], impact_position: null }}
        onChange={onChange}
      />,
    )

    const origin = screen.getByLabelText('Marcador de origen')
    fireEvent.keyDown(origin, { key: 'ArrowRight' })
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ launch_position: [1, 0.01] }),
    )

    fireEvent.keyDown(origin, { key: 'ArrowUp', shiftKey: true })
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ launch_position: [0.99, 0] }),
    )
  })

  it('updates coordinates through the numeric inputs', () => {
    const onChange = vi.fn()
    render(
      <GrenadeEditor
        map={map}
        value={{ launch_position: [0.5, 0.5], impact_position: [0.5, 0.5] }}
        onChange={onChange}
      />,
    )

    fireEvent.change(screen.getByLabelText('Destino X'), {
      target: { value: '0.75' },
    })
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ impact_position: [0.75, 0.5] }),
    )
  })

  it('zooms and resets the viewport', () => {
    render(<GrenadeEditor map={map} value={{}} onChange={() => {}} />)

    expect(screen.getByRole('status')).toHaveTextContent('100%')
    fireEvent.click(screen.getByRole('button', { name: 'Acercar' }))
    expect(screen.getByRole('status')).toHaveTextContent('125%')
    fireEvent.click(screen.getByRole('button', { name: 'Restablecer vista' }))
    expect(screen.getByRole('status')).toHaveTextContent('100%')
  })

  it('disables editing controls in read-only mode', () => {
    const onChange = vi.fn()
    render(
      <GrenadeEditor
        map={map}
        value={{ launch_position: [0.5, 0.5] }}
        onChange={onChange}
        readOnly
      />,
    )

    expect(screen.getByRole('button', { name: 'Acercar' })).toBeDisabled()
    expect(screen.getByLabelText('Origen X')).toBeDisabled()
    fireEvent.keyDown(screen.getByLabelText('Marcador de origen'), {
      key: 'ArrowRight',
    })
    expect(onChange).not.toHaveBeenCalled()
  })
})
