import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createMap, updateMap } from '../../services/maps.js'
import MapFormModal from './MapFormModal.jsx'

vi.mock('../../services/maps.js', () => ({
  createMap: vi.fn(),
  updateMap: vi.fn(),
}))

function submitForm() {
  fireEvent.submit(
    screen.getByRole('button', { name: 'Crear mapa' }).closest('form'),
  )
}

describe('MapFormModal', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders the creation title', () => {
    render(
      <MapFormModal
        open
        map={null}
        onClose={() => {}}
        onSaved={() => {}}
      />,
    )

    expect(screen.getByText('Nuevo mapa')).toBeInTheDocument()
  })

  it('shows validation errors and skips the API when fields are empty', async () => {
    render(
      <MapFormModal
        open
        map={null}
        onClose={() => {}}
        onSaved={() => {}}
      />,
    )

    submitForm()

    expect(
      await screen.findByText('El nombre es obligatorio.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('La URL de la imagen es obligatoria.'),
    ).toBeInTheDocument()
    expect(createMap).not.toHaveBeenCalled()
  })

  it('creates a map with a trimmed payload', async () => {
    createMap.mockResolvedValue({ id: 5, name: 'Mirage' })
    const onClose = vi.fn()
    const onSaved = vi.fn()
    render(
      <MapFormModal open map={null} onClose={onClose} onSaved={onSaved} />,
    )

    fireEvent.change(screen.getByLabelText('Nombre'), {
      target: { value: '  Mirage  ' },
    })
    fireEvent.change(screen.getByLabelText('URL de la imagen'), {
      target: { value: ' https://x/y.jpg ' },
    })
    submitForm()

    await waitFor(() =>
      expect(createMap).toHaveBeenCalledWith({
        name: 'Mirage',
        image_url: 'https://x/y.jpg',
        active_pool: false,
      }),
    )
    await waitFor(() =>
      expect(onSaved).toHaveBeenCalledWith({ id: 5, name: 'Mirage' }),
    )
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('sends server field errors back to the form', async () => {
    createMap.mockRejectedValue({
      response: { data: { fields: { name: 'Ya existe.' } } },
    })
    render(
      <MapFormModal
        open
        map={null}
        onClose={() => {}}
        onSaved={() => {}}
      />,
    )

    fireEvent.change(screen.getByLabelText('Nombre'), {
      target: { value: 'Mirage' },
    })
    fireEvent.change(screen.getByLabelText('URL de la imagen'), {
      target: { value: 'https://x/y.jpg' },
    })
    submitForm()

    expect(await screen.findByText('Ya existe.')).toBeInTheDocument()
  })

  it('updates an existing map', async () => {
    updateMap.mockResolvedValue({ id: 9, name: 'Inferno' })
    const onSaved = vi.fn()
    render(
      <MapFormModal
        open
        map={{
          id: 9,
          name: 'Inferno',
          image_url: 'https://x/i.jpg',
          active_pool: true,
        }}
        onClose={() => {}}
        onSaved={onSaved}
      />,
    )

    expect(screen.getByText('Editar mapa')).toBeInTheDocument()
    fireEvent.submit(
      screen.getByRole('button', { name: 'Guardar cambios' }).closest('form'),
    )

    await waitFor(() =>
      expect(updateMap).toHaveBeenCalledWith(9, {
        name: 'Inferno',
        image_url: 'https://x/i.jpg',
        active_pool: true,
      }),
    )
    await waitFor(() =>
      expect(onSaved).toHaveBeenCalledWith({ id: 9, name: 'Inferno' }),
    )
  })
})
