import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import StatCard from './StatCard.jsx'

describe('StatCard', () => {
  it('renders the value, label and icon', () => {
    render(
      <StatCard
        icon={<span data-testid="icon" />}
        value="alice"
        label="Nombre de usuario"
      />,
    )

    expect(screen.getByText('alice')).toBeInTheDocument()
    expect(screen.getByText('Nombre de usuario')).toBeInTheDocument()
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })
})
