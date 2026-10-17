import { describe, expect, it } from 'vitest'

import { extractYoutubeId, youtubeEmbedUrl } from './video.js'

describe('extractYoutubeId', () => {
  it('extracts the id from a watch url', () => {
    expect(
      extractYoutubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
    ).toBe('dQw4w9WgXcQ')
  })

  it('extracts the id from a short url', () => {
    expect(extractYoutubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('returns null for invalid input', () => {
    expect(extractYoutubeId('')).toBeNull()
    expect(extractYoutubeId('https://example.com/video')).toBeNull()
  })
})

describe('youtubeEmbedUrl', () => {
  it('builds an embed url from a valid link', () => {
    expect(youtubeEmbedUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
    )
  })

  it('returns null when the link is invalid', () => {
    expect(youtubeEmbedUrl('not-a-video')).toBeNull()
  })
})
