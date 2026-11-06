import { beforeEach, describe, expect, it, vi } from 'vitest'

import api from './api'
import { deleteMap, restoreMap } from './maps.js'

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('maps service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('devuelve la respuesta del borrado para distinguir eliminación de archivado', async () => {
    api.delete.mockResolvedValue({
      data: { message: 'Map archived', archived: true },
    })

    const result = await deleteMap(7)

    expect(api.delete).toHaveBeenCalledWith('/maps/7')
    expect(result).toEqual({ message: 'Map archived', archived: true })
  })

  it('restaura un mapa archivado mediante el endpoint administrativo', async () => {
    api.post.mockResolvedValue({ data: { map: { id: 7, status: 'ACTIVE' } } })

    const result = await restoreMap(7)

    expect(api.post).toHaveBeenCalledWith('/maps/7/unarchive')
    expect(result).toEqual({ id: 7, status: 'ACTIVE' })
  })
})
