import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import GrenadeFormModal from './GrenadeFormModal.jsx'

describe('assembled grenade form', () => {
  it('renders real child modules and edits media without losing field state', () => {
    render(<GrenadeFormModal
      open
      map={{ id: 1, name: 'Mirage', image_url: '/mirage.png', callouts: [] }}
      onClose={vi.fn()}
      onSaved={vi.fn()}
    />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Crear granada' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Agregar medio' }))
    const url = screen.getByLabelText('URL del medio 1')
    fireEvent.change(url, { target: { value: 'https://example.test/grenade.png' } })
    expect(url).toHaveValue('https://example.test/grenade.png')
    fireEvent.click(screen.getByRole('button', { name: 'Quitar medio' }))
    expect(screen.queryByLabelText('URL del medio 1')).not.toBeInTheDocument()
  })
})
