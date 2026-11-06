import { beforeEach, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import StrategyEditor from './StrategyEditor.jsx'
const mocks = vi.hoisted(() => ({ save: vi.fn(), get: vi.fn() }))
vi.mock('../../services/api.js', () => ({ default: { get: mocks.get } }))
vi.mock('../../services/tactics.js', () => ({ saveStrategy: mocks.save, fetchRevisions: vi.fn(), restoreStrategy: vi.fn() }))
beforeEach(() => { mocks.get.mockResolvedValue({ data: { lineups: [] } }); mocks.save.mockReset() })
it('saves the versioned normalized document and reports success', async () => {
  const document = { schema_version: 1, elements: [], assignments: [], steps: [], notes: '' }
  mocks.save.mockResolvedValue({ id: 2, name: 'Execute', side: 'T', category: 'Default', status: 'DRAFT', description: '', version: 1, document })
  render(<StrategyEditor teamId={1} map={{ id: 3, name: 'Mirage', image_url: '/radar.png', callouts: [] }} lineups={[]} canEdit onSaved={vi.fn()} onClose={vi.fn()} />)
  fireEvent.change(screen.getByLabelText('Nombre de estrategia'), { target: { value: 'Execute' } })
  fireEvent.click(screen.getByRole('button', { name: 'Guardar estrategia' }))
  await waitFor(() => expect(mocks.save).toHaveBeenCalledWith(1, expect.objectContaining({ map_id: 3, name: 'Execute', document }), undefined))
  expect(await screen.findByText('Guardada · versión 1')).toBeInTheDocument()
})
it('keeps editing content and reports failed saves', async () => {
  mocks.save.mockRejectedValue(new Error('offline'))
  render(<StrategyEditor teamId={1} map={{ id: 3, name: 'Mirage', image_url: '/radar.png', callouts: [] }} lineups={[]} canEdit onSaved={vi.fn()} onClose={vi.fn()} />)
  fireEvent.change(screen.getByLabelText('Nombre de estrategia'), { target: { value: 'Keep me' } })
  fireEvent.click(screen.getByRole('button', { name: 'Guardar estrategia' }))
  expect(await screen.findByRole('alert')).toBeInTheDocument()
  expect(screen.getByLabelText('Nombre de estrategia')).toHaveValue('Keep me')
})
