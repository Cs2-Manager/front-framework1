import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MapLibraryFilters, { filterMaps } from './MapLibraryFilters.jsx'
import MapCard from './MapCard.jsx'
import { buildMapPayload, mapToForm } from './mapForm.js'

describe('Map library', () => {
  it('filters and sorts without changing the original collection', () => {
    const maps = [{ name: 'Nuke', active_pool: true }, { name: 'Ancient', active_pool: false }, { name: 'Mirage', active_pool: true }]
    expect(filterMaps(maps, { q: '', pool: 'active', sort: 'name' }).map(m => m.name)).toEqual(['Mirage', 'Nuke'])
    expect(filterMaps(maps, { q: ' ANCI ', pool: 'all', sort: 'name' }).map(m => m.name)).toEqual(['Ancient'])
    expect(maps[0].name).toBe('Nuke')
  })
  it('filters by catalog category and status', () => {
    const maps = [
      { name: 'Nuke', active_pool: true, category: 'COMPETITIVE', status: 'ACTIVE' },
      { name: 'Cache', active_pool: false, category: 'RETIRED', status: 'ARCHIVED' },
      { name: 'Train', active_pool: false, category: 'TEMPORARY', status: 'ACTIVE' },
    ]
    expect(filterMaps(maps, { category: 'RETIRED' }).map(m => m.name)).toEqual(['Cache'])
    expect(filterMaps(maps, { status: 'active' }).map(m => m.name)).toEqual(['Nuke', 'Train'])
    expect(filterMaps(maps, { category: 'TEMPORARY', status: 'ACTIVE' }).map(m => m.name)).toEqual(['Train'])
  })
  it('sorts by catalog display order and last update', () => {
    const maps = [
      { name: 'B', display_order: 2, updated_at: '2026-01-01' },
      { name: 'A', display_order: 1, updated_at: '2026-03-01' },
    ]
    expect(filterMaps(maps, { sort: 'display_order' }).map(m => m.name)).toEqual(['A', 'B'])
    expect(filterMaps(maps, { sort: 'updated' }).map(m => m.name)).toEqual(['A', 'B'])
  })
  it('exposes labelled search and filters', () => {
    const onChange = vi.fn()
    render(<MapLibraryFilters filters={{ q: '', pool: 'all', sort: 'name' }} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Buscar mapa'), { target: { value: 'Nuke' } })
    expect(onChange).toHaveBeenCalledWith({ q: 'Nuke', pool: 'all', sort: 'name' })
    expect(screen.getByLabelText('Map pool')).toBeInTheDocument()
  })
  it('exposes category and status selects', () => {
    const onChange = vi.fn()
    render(
      <MapLibraryFilters
        filters={{ q: '', pool: 'all', category: 'all', status: 'active', sort: 'name' }}
        onChange={onChange}
      />,
    )
    expect(screen.getByLabelText('Categoría')).toHaveValue('all')
    expect(screen.getByLabelText('Estado')).toHaveValue('ACTIVE')
    fireEvent.change(screen.getByLabelText('Categoría'), {
      target: { value: 'RETIRED' },
    })
    expect(onChange).toHaveBeenCalledWith({
      q: '',
      pool: 'all',
      category: 'RETIRED',
      status: 'active',
      sort: 'name',
    })
  })
  it('shows non-competitive and archived badges', () => {
    render(
      <MemoryRouter>
        <MapCard
          map={{
            id: 2,
            name: 'Cache',
            image_url: '/cache.png',
            callouts: [],
            category: 'RETIRED',
            status: 'ARCHIVED',
          }}
        />
      </MemoryRouter>,
    )
    expect(screen.getByText('Retirado')).toBeInTheDocument()
    expect(screen.getByText('Archivado')).toBeInTheDocument()
  })
  it('distinguishes cover from radar and hides unavailable editing actions', () => {
    render(<MemoryRouter><MapCard map={{ id: 1, name: 'Nuke', image_url: '/radar.png', cover_url: '/cover.jpg', description: 'Two levels', callouts: [] }} /></MemoryRouter>)
    expect(screen.getByAltText('Nuke')).toHaveAttribute('src', '/cover.jpg')
    expect(screen.getByAltText('Plano táctico de Nuke')).toHaveAttribute('src', '/radar.png')
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument()
    expect(screen.getByText('Two levels')).toBeInTheDocument()
  })
  it('round trips extended metadata through the editing form', () => {
    const map = { name: 'Nuke', image_url: 'https://example.com/radar.png', cover_url: null, description: ' Two levels ', active_pool: true }
    expect(buildMapPayload(mapToForm(map))).toEqual({ ...map, cover_url: '', description: 'Two levels' })
  })
})
