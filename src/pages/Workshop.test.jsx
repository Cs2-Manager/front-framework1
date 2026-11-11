import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import Workshop from './Workshop.jsx'
import {
  deleteWorkshopMap,
  fetchWorkshopMaps,
} from '../services/workshopMaps.js'

vi.mock('../services/workshopMaps.js', () => ({
  WORKSHOP_CATEGORIES: ['Aim', 'Recoil', 'Crosshair', 'HUD', 'Warmup'],
  fetchWorkshopMaps: vi.fn(),
  deleteWorkshopMap: vi.fn(),
}))

const MAPS = [
  {
    id: 1,
    title: 'Aim Botz',
    category: 'Aim',
    description: 'Entrenamiento de puntería',
    image_url: null,
    workshop_url: 'https://steam.test/aim',
  },
  {
    id: 2,
    title: 'Recoil Master',
    category: 'Recoil',
    description: '',
    image_url: 'https://img.test/recoil.png',
    workshop_url: 'https://steam.test/recoil',
  },
]

function renderPage() {
  return render(
    <MemoryRouter>
      <Workshop />
    </MemoryRouter>,
  )
}

describe('Workshop page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('loads and groups workshop maps by category', async () => {
    fetchWorkshopMaps.mockResolvedValue(MAPS)

    renderPage()

    expect(await screen.findByRole('heading', { name: 'Aim Botz' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Recoil Master' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Todas/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getAllByRole('tab')).toHaveLength(6)
  })

  it('filters the visible maps when a category tab is selected', async () => {
    fetchWorkshopMaps.mockResolvedValue(MAPS)

    renderPage()
    await screen.findByRole('heading', { name: 'Aim Botz' })

    fireEvent.click(screen.getByRole('tab', { name: /Recoil/ }))

    expect(screen.queryByRole('heading', { name: 'Aim Botz' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Recoil Master' })).toBeInTheDocument()
  })

  it('shows the empty state when the category has no maps', async () => {
    fetchWorkshopMaps.mockResolvedValue(MAPS)

    renderPage()
    await screen.findByRole('heading', { name: 'Aim Botz' })

    fireEvent.click(screen.getByRole('tab', { name: /HUD/ }))

    expect(
      screen.getByText('No hay mapas en la categoría «HUD» todavía.'),
    ).toBeInTheDocument()
  })

  it('deletes a workshop map after confirmation', async () => {
    fetchWorkshopMaps.mockResolvedValue(MAPS)
    deleteWorkshopMap.mockResolvedValue({})

    renderPage()
    await screen.findByRole('heading', { name: 'Aim Botz' })

    fireEvent.click(screen.getAllByRole('button', { name: /eliminar/i })[0])
    // El diálogo añade un segundo botón "Eliminar" que confirma el borrado.
    const buttons = await screen.findAllByRole('button', { name: /eliminar/i })
    fireEvent.click(buttons[buttons.length - 1])

    await waitFor(() =>
      expect(deleteWorkshopMap).toHaveBeenCalledWith(1),
    )
  })

  it('shows the service error when loading fails', async () => {
    fetchWorkshopMaps.mockRejectedValue(new Error('boom'))

    renderPage()

    expect(
      await screen.findByText(
        'No se pudieron cargar los mapas de la Workshop. Intentalo de nuevo.',
      ),
    ).toBeInTheDocument()
  })
})
