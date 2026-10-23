import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import LineupFilters from './LineupFilters.jsx'

const MAPS = [
  { id: 1, name: 'Mirage' },
  { id: 2, name: 'Inferno' },
]

const EMPTY = { map_id: '', type: '', side: '' }

describe('LineupFilters', () => {
  it('lists the available maps', () => {
    render(<LineupFilters maps={MAPS} filters={EMPTY} onChange={() => {}} />)
    expect(screen.getByRole('option', { name: 'Mirage' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Inferno' })).toBeInTheDocument()
  })

  it('emits the updated filter when the map changes', () => {
    const onChange = vi.fn()
    render(<LineupFilters maps={MAPS} filters={EMPTY} onChange={onChange} />)

    fireEvent.change(screen.getByLabelText('Mapa'), {
      target: { value: '2' },
    })

    expect(onChange).toHaveBeenCalledWith({
      map_id: '2',
      type: '',
      side: '',
    })
  })
})
