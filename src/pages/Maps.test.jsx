import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import Maps from './Maps.jsx'
import { deleteMap, fetchMaps, restoreMap } from '../services/maps.js'
import { fetchMyTeam } from '../services/teams.js'

const mocks = vi.hoisted(() => ({ useAuth: vi.fn() }))

vi.mock('../context/AuthContext.jsx', () => ({ useAuth: mocks.useAuth }))
vi.mock('../services/maps.js', () => ({
  fetchMaps: vi.fn(),
  deleteMap: vi.fn(),
  restoreMap: vi.fn(),
  createMap: vi.fn(),
  updateMap: vi.fn(),
}))
vi.mock('../services/teams.js', () => ({ fetchMyTeam: vi.fn() }))
vi.mock('../services/api.js', () => ({ default: { get: vi.fn() } }))

const ACTIVE_MAP = {
  id: 3,
  name: 'QA Delete Map',
  image_url: '',
  cover_url: null,
  description: '',
  active_pool: false,
  category: 'COMPETITIVE',
  status: 'ACTIVE',
  callouts: [],
  updated_at: '2026-11-03T00:00:00',
  display_order: 0,
}

const ARCHIVED_MAP = { ...ACTIVE_MAP, status: 'ARCHIVED' }

function renderMaps() {
  return render(
    <MemoryRouter>
      <Maps />
    </MemoryRouter>,
  )
}

function confirmDeletion() {
  const buttons = screen.getAllByRole('button', { name: 'Eliminar' })
  fireEvent.click(buttons[buttons.length - 1])
}

describe('Maps page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.useAuth.mockReturnValue({ user: { is_admin: true } })
    fetchMyTeam.mockResolvedValue(null)
  })

  it('envía el id numérico del mapa al confirmar la eliminación', async () => {
    fetchMaps.mockResolvedValue([ACTIVE_MAP])
    deleteMap.mockResolvedValue({ archived: false })

    renderMaps()
    await screen.findAllByText('QA Delete Map')

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))
    confirmDeletion()

    await waitFor(() => expect(deleteMap).toHaveBeenCalledWith(3))
    expect(
      await screen.findByText('Mapa «QA Delete Map» eliminado.'),
    ).toBeInTheDocument()
    await waitFor(() => expect(fetchMaps).toHaveBeenCalledTimes(2))
  })

  it('informa cuando el mapa se archiva por tener información asociada', async () => {
    fetchMaps.mockResolvedValue([ACTIVE_MAP])
    deleteMap.mockResolvedValue({ archived: true })

    renderMaps()
    await screen.findAllByText('QA Delete Map')

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))
    confirmDeletion()

    expect(
      await screen.findByText(
        'Este mapa contiene información asociada. Se archivó en lugar de eliminarse.',
      ),
    ).toBeInTheDocument()
  })

  it('muestra el error del backend cuando la eliminación falla', async () => {
    fetchMaps.mockResolvedValue([ACTIVE_MAP])
    deleteMap.mockRejectedValue({ response: { data: { error: 'Map not found' } } })

    renderMaps()
    await screen.findAllByText('QA Delete Map')

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))
    confirmDeletion()

    expect(await screen.findByText('Map not found')).toBeInTheDocument()
  })

  it('permite restaurar un mapa archivado y recarga la biblioteca', async () => {
    fetchMaps.mockResolvedValue([ARCHIVED_MAP])
    restoreMap.mockResolvedValue({ ...ARCHIVED_MAP, status: 'ACTIVE' })

    renderMaps()
    await screen.findByLabelText('Estado')

    fireEvent.change(screen.getByLabelText('Estado'), {
      target: { name: 'status', value: 'ARCHIVED' },
    })

    fireEvent.click(await screen.findByRole('button', { name: 'Restaurar' }))

    await waitFor(() => expect(restoreMap).toHaveBeenCalledWith(3))
    expect(
      await screen.findByText('Mapa «QA Delete Map» restaurado.'),
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(fetchMaps).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'ARCHIVED' }),
      ),
    )
  })

  it('oculta la eliminación y ofrece restaurar en tarjetas archivadas', async () => {
    fetchMaps.mockResolvedValue([ARCHIVED_MAP])

    renderMaps()
    await screen.findByLabelText('Estado')

    fireEvent.change(screen.getByLabelText('Estado'), {
      target: { name: 'status', value: 'ARCHIVED' },
    })

    expect(await screen.findByRole('button', { name: 'Restaurar' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Eliminar' })).not.toBeInTheDocument()
  })
})
