const YOUTUBE_RE =
  /(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|shorts\/|live\/|)([\w-]{11})/

export function extractYoutubeId(url) {
  if (!url) return null
  const match = url.match(YOUTUBE_RE)
  return match ? match[1] : null
}

export function youtubeEmbedUrl(url) {
  const id = extractYoutubeId(url)
  return id ? `https://www.youtube.com/embed/${id}` : null
}