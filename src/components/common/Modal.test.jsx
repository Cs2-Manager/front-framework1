import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import Modal from './Modal.jsx'

describe('Modal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <Modal open={false} title="Título" onClose={() => {}}>
        contenido
      </Modal>,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the title and children when open', () => {
    render(
      <Modal open title="Título" onClose={() => {}}>
        <p>contenido</p>
      </Modal>,
    )
    expect(screen.getByText('Título')).toBeInTheDocument()
    expect(screen.getByText('contenido')).toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn()
    render(
      <Modal open title="Título" onClose={onClose}>
        contenido
      </Modal>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
