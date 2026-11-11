import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import Lineups from './Lineups.jsx'
import { fetchMyTeam } from '../services/teams.js'
import { fetchMaps } from '../services/maps.js'
import { deleteLineup, fetchLineups } from '../services/lineups.js'

vi.mock('../services/teams.js', () => ({ fetchMyTeam: vi.fn() }))
vi.mock('../services/maps.js', () => ({ fetchMaps: vi.fn() }))
vi.mock('../services/lineups.js', () => ({
  deleteLineup: vi.fn(),
  fetchLineups: vi.fn(),
}))
vi.mock('../components/lineups/LineupsView.jsx', () => ({
  LineupsHeader: ({ onCreate }) => (
    <button type="button" onClick={onCreate}>
      Nuevo lineup
    </button>
  ),
  LineupsCollection: ({ view }) => (
    <div>
      <p>Lineups visibles: {view.page.items.length}</p>
      <p>Mapas: {view.maps.length}</p>
      <button
        type="button"
        onClick={() => view.setFilters({ map_id: 2, type: '', side: '' })}
      >
        Filtrar
      </button>
      <button type="button" onClick={() => view.page.deletion.ask(view.page.items[0])}>
        Eliminar primero
      </button>
    </div>
  ),
  LineupModals: ({ modal, deletion }) => (
    <>
      {modal.open ? <p>Modal abierto</p> : null}
      {deletion.pending ? (
        <button type="button" onClick={deletion.confirm}>
          Confirmar borrado
        </button>
      ) : null}
    </>
  ),
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <Lineups />
    </MemoryRouter>,
  )
}

describe('Lineups page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('links to the competitive lineups of the active team', async () => {
    fetchMyTeam.mockResolvedValue({ id: 4 })
    fetchMaps.mockResolvedValue([{ id: 2, name: 'Mirage' }])
    fetchLineups.mockResolvedValue([{ id: 1, map_id: 2 }])

    renderPage()

    expect(
      await screen.findByRole('link', { name: 'Alineaciones competitivas' }),
    ).toHaveAttribute('href', '/teams/4/lineups')
    expect(await screen.findByText('Lineups visibles: 1')).toBeInTheDocument()
    expect(screen.getByText('Mapas: 1')).toBeInTheDocument()
  })

  it('falls back to the directory when the user has no team', async () => {
    fetchMyTeam.mockRejectedValue(new Error('none'))
    fetchMaps.mockResolvedValue([])
    fetchLineups.mockResolvedValue([])

    renderPage()

    expect(
      await screen.findByRole('link', { name: 'Alineaciones competitivas' }),
    ).toHaveAttribute('href', '/teams')
  })

  it('reloads the collection when filters change', async () => {
    fetchMyTeam.mockResolvedValue(null)
    fetchMaps.mockResolvedValue([])
    fetchLineups.mockResolvedValue([])

    renderPage()
    await screen.findByText('Lineups visibles: 0')

    fireEvent.click(screen.getByRole('button', { name: 'Filtrar' }))

    await waitFor(() =>
      expect(fetchLineups).toHaveBeenLastCalledWith({ map_id: 2 }),
    )
  })

  it('opens the create modal from the header', async () => {
    fetchMyTeam.mockResolvedValue(null)
    fetchMaps.mockResolvedValue([])
    fetchLineups.mockResolvedValue([])

    renderPage()
    await screen.findByText('Lineups visibles: 0')

    fireEvent.click(screen.getByRole('button', { name: 'Nuevo lineup' }))

    expect(screen.getByText('Modal abierto')).toBeInTheDocument()
  })

  it('deletes a lineup through the shared deletion flow', async () => {
    fetchMyTeam.mockResolvedValue(null)
    fetchMaps.mockResolvedValue([])
    fetchLineups.mockResolvedValue([{ id: 1, map_id: 2 }])
    deleteLineup.mockResolvedValue({})

    renderPage()
    await screen.findByText('Lineups visibles: 1')

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar primero' }))
    fireEvent.click(
      await screen.findByRole('button', { name: 'Confirmar borrado' }),
    )

    await waitFor(() => expect(deleteLineup).toHaveBeenCalledWith(1))
  })
})
