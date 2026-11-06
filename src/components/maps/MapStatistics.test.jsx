import { expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import MapStatistics from './MapStatistics.jsx'
const get = vi.hoisted(() => vi.fn())
vi.mock('../../services/api.js', () => ({ default: { get } }))
it('labels verified individual data and does not fabricate team statistics', async () => {
  get.mockResolvedValue({ data: { players: [{ user_id: 1, nickname: 'Entry', matches_played: 3, wins: 2, losses: 1, win_rate: 66.7, kd: 1.2, adr: 85, hs_percentage: 50 }] } })
  render(<MapStatistics team={{ id: 1 }} map={{ id: 2 }} />)
  expect(await screen.findByText('Entry')).toBeInTheDocument()
  expect(screen.getByText(/Estas métricas son individuales/)).toBeInTheDocument()
  expect(screen.getByText(/no hay partidas FACEIT verificadas/)).toBeInTheDocument()
})
it('shows empty and failure states', async () => {
  get.mockRejectedValue(new Error('offline'))
  render(<MapStatistics team={{ id: 1 }} map={{ id: 2 }} />)
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar')
})
it('limits lineup comparison statistics to players in that lineup', async () => {
  get.mockResolvedValue({ data: { players: [{ user_id: 1, nickname: 'In lineup' }, { user_id: 2, nickname: 'Other roster' }] } })
  render(<MapStatistics team={{ id: 1 }} map={{ id: 2 }} playerIds={[1]} />)
  expect(await screen.findByText('In lineup')).toBeInTheDocument()
  expect(screen.queryByText('Other roster')).not.toBeInTheDocument()
})
