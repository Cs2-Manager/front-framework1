import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import ConfirmDialog from './ConfirmDialog.jsx'

describe('ConfirmDialog', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <ConfirmDialog
        open={false}
        title="Eliminar"
        message="¿Seguro?"
        onCancel={() => {}}
        onConfirm={() => {}}
      />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the message and triggers the callbacks', () => {
    const onCancel = vi.fn()
    const onConfirm = vi.fn()
    render(
      <ConfirmDialog
        open
        title="Eliminar mapa"
        message="¿Seguro que querés eliminarlo?"
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    )

    expect(screen.getByText('¿Seguro que querés eliminarlo?')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onCancel).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('disables the confirm button while busy', () => {
    render(
      <ConfirmDialog
        open
        title="Eliminar"
        message="m"
        busy
        onCancel={() => {}}
        onConfirm={() => {}}
      />,
    )
    expect(
      screen.getByRole('button', { name: 'Eliminando…' }),
    ).toBeDisabled()
  })
})
