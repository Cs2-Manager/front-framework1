import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FaceitLinkCard from './FaceitLinkCard.jsx'
import { discoverFaceit, linkFaceit, startFaceitOauth } from '../../services/faceit.js'

vi.mock('../../services/faceit.js', () => ({
  discoverFaceit: vi.fn(), linkFaceit: vi.fn(), startFaceitOauth: vi.fn(),
}))

describe('FACEIT linking request states', () => {
  beforeEach(() => vi.resetAllMocks())

  it('disables discovery during loading and lets the owner retry a failure', async () => {
    let rejectRequest
    discoverFaceit.mockReturnValueOnce(new Promise((_, reject) => { rejectRequest = reject }))
    render(<FaceitLinkCard faceit={{ configured: true }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Descubrir desde Steam' }))
    expect(screen.getByRole('button', { name: 'Buscando…' })).toBeDisabled()
    await act(async () => rejectRequest(new Error('offline')))
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos consultar FACEIT')
    discoverFaceit.mockResolvedValue({ found: false })
    fireEvent.click(screen.getByRole('button', { name: 'Descubrir desde Steam' }))
    expect(await screen.findByText(/No encontramos una cuenta FACEIT/)).toBeInTheDocument()
  })

  it('never offers linking for a claimed account', async () => {
    discoverFaceit.mockResolvedValue({
      found: true, claimed: true, player: { player_id: 'claimed', nickname: 'Jugador' },
      message: 'La cuenta pertenece a otro usuario.',
    })
    render(<FaceitLinkCard faceit={{ configured: true }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Descubrir desde Steam' }))
    expect(await screen.findByText('La cuenta pertenece a otro usuario.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Vincular esta cuenta' })).not.toBeInTheDocument()
    expect(linkFaceit).not.toHaveBeenCalled()
  })

  it('keeps the preview and reports a failed link without calling onChange', async () => {
    const onChange = vi.fn()
    discoverFaceit.mockResolvedValue({ found: true, player: { player_id: 'player-1', nickname: 'Jugador' } })
    linkFaceit.mockRejectedValue(new Error('offline'))
    render(<FaceitLinkCard faceit={{ configured: true }} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Descubrir desde Steam' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Vincular esta cuenta' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos vincular')
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByText('Jugador')).toBeInTheDocument()
  })

  it('restores the OAuth action after a request failure', async () => {
    startFaceitOauth.mockRejectedValue(new Error('offline'))
    render(<FaceitLinkCard faceit={{ configured: true, oauth_configured: true }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Verificar con FACEIT Connect' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos iniciar')
    expect(screen.getByRole('button', { name: 'Verificar con FACEIT Connect' })).toBeEnabled()
  })
})
