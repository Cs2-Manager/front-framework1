import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import EmptyState from './EmptyState.jsx'

describe('EmptyState', () => {
  it('renders the message without an action button', () => {
    render(<EmptyState message="No hay datos" />)
    expect(screen.getByText('No hay datos')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('runs the action when the button is clicked', () => {
    const onAction = vi.fn()
    render(
      <EmptyState message="Vacío" actionLabel="Crear" onAction={onAction} />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Crear' }))
    expect(onAction).toHaveBeenCalledTimes(1)
  })
})
