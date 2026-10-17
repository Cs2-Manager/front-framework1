import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import WorkshopTabs from './WorkshopTabs.jsx'

const TABS = ['Todas', 'Aim', 'Recoil']

describe('WorkshopTabs', () => {
  it('renders each tab with its count and marks the active one', () => {
    render(
      <WorkshopTabs
        tabs={TABS}
        activeTab="Todas"
        counts={{ Todas: 2, Aim: 1, Recoil: 0 }}
        onChange={() => {}}
      />,
    )

    expect(screen.getByRole('tab', { name: /Todas/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tab', { name: /Aim/ })).toHaveAttribute(
      'aria-selected',
      'false',
    )
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('notifies the selected tab when clicked', () => {
    const onChange = vi.fn()
    render(
      <WorkshopTabs
        tabs={TABS}
        activeTab="Todas"
        counts={{}}
        onChange={onChange}
      />,
    )

    fireEvent.click(screen.getByRole('tab', { name: /Aim/ }))
    expect(onChange).toHaveBeenCalledWith('Aim')
  })
})
