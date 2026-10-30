import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import CollectionView from './CollectionView.jsx'

describe('CollectionView', () => {
  it('renders the loading message instead of the content', () => {
    render(
      <CollectionView loading loadingText="Cargando…">
        contenido
      </CollectionView>,
    )

    expect(screen.getByText('Cargando…')).toBeInTheDocument()
    expect(screen.queryByText('contenido')).not.toBeInTheDocument()
  })

  it('renders the error alert', () => {
    render(<CollectionView error="Falló la carga">contenido</CollectionView>)

    expect(screen.getByRole('alert')).toHaveTextContent('Falló la carga')
  })

  it('renders the empty state with its action', () => {
    const onAction = vi.fn()
    render(
      <CollectionView
        isEmpty
        empty={{ message: 'Nada por acá', actionLabel: 'Crear', onAction }}
      >
        contenido
      </CollectionView>,
    )

    expect(screen.getByText('Nada por acá')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Crear' }))
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('renders the children when there is content', () => {
    render(<CollectionView isEmpty={false}>contenido</CollectionView>)

    expect(screen.getByText('contenido')).toBeInTheDocument()
  })
})
