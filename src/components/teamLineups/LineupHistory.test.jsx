import { expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import LineupHistory from './LineupHistory.jsx'
const get = vi.hoisted(() => vi.fn())
vi.mock('../../services/api.js', () => ({ default: { get } }))
it('retains deleted lineup snapshots in the team history', async () => {
  get.mockResolvedValue({ data: { history: [{ id: 1, action: 'DELETED', actor_id: 3, created_at: '2026-10-31T10:00:00', before: { name: 'Mirage Main', status: 'DRAFT', map_id: 2, players: [{ user_id: 8, role: 'AWPER', is_starter: true }] }, after: null }] } })
  render(<LineupHistory teamId={1} />)
  expect(await screen.findByText(/DELETED · Mirage Main/)).toBeInTheDocument()
  expect(screen.getByText('Jugador 8: AWPER · Titular')).toBeInTheDocument()
  expect(screen.getByText('Sin alineación')).toBeInTheDocument()
  expect(get).toHaveBeenCalledWith('/teams/1/lineups/history')
})
