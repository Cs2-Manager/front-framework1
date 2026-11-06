/**
 * Verifica que el frontend servido (nginx en Docker o `vite preview`)
 * responda index.html en las rutas del router y que /api no caiga en el
 * fallback SPA.
 *
 * Uso:
 *   node scripts/verify-spa-routes.mjs
 *   FRONT_URL=http://localhost:4173 API_URL=http://localhost/api \
 *     node scripts/verify-spa-routes.mjs
 */

const FRONT_URL = (process.env.FRONT_URL || 'http://localhost').replace(/\/$/, '')
const API_URL = (process.env.API_URL || 'http://localhost/api').replace(
  /\/$/,
  '',
)

const ROUTES = [
  '/',
  '/players',
  '/players/1',
  '/teams',
  '/teams/1',
  '/teams/1/lineups',
  '/teams/1/lineups/1',
  '/teams/mine',
  '/teams/new',
  '/teams/1/edit',
  '/maps',
  '/maps/1',
  '/workshop',
  '/lineups',
  '/invitations',
  '/profile',
  '/profile/edit',
  '/login',
  '/register',
  '/steam/callback',
  '/ruta-inexistente',
]

const failures = []

async function fetchWithTimeout(url, options = {}) {
  return fetch(url, { ...options, signal: AbortSignal.timeout(15000) })
}

function looksLikeSpaHtml(body) {
  return /<div[^>]+id=["']root["']/.test(body)
}

async function checkSpaRoute(route) {
  const url = `${FRONT_URL}${route}`
  try {
    const response = await fetchWithTimeout(url, {
      headers: { Accept: 'text/html' },
      redirect: 'follow',
    })
    const body = await response.text()
    const contentType = response.headers.get('content-type') || ''

    if (response.status !== 200) {
      failures.push(`${route} → HTTP ${response.status}`)
      return
    }
    if (!contentType.includes('text/html') || !looksLikeSpaHtml(body)) {
      failures.push(`${route} → no devolvió el HTML de la SPA`)
      return
    }
    console.log(`  ok  ${route}`)
  } catch (error) {
    failures.push(`${route} → ${error.message}`)
  }
}

async function checkApiNotSpa() {
  const url = `${FRONT_URL}/api/health`
  try {
    const response = await fetchWithTimeout(url, {
      headers: { Accept: 'application/json' },
    })
    const body = await response.text()
    if (looksLikeSpaHtml(body)) {
      failures.push('/api/health → el fallback SPA está capturando la API')
      return
    }
    console.log(`  ok  /api/health no devuelve HTML (HTTP ${response.status})`)
  } catch (error) {
    failures.push(`/api/health → ${error.message}`)
  }
}

async function checkApiHealth() {
  const url = `${API_URL}/health`
  try {
    const response = await fetchWithTimeout(url, {
      headers: { Accept: 'application/json' },
    })
    const body = await response.text()
    if (response.status !== 200) {
      failures.push(`API ${url} → HTTP ${response.status}`)
      return
    }
    JSON.parse(body)
    console.log(`  ok  API ${url}`)
  } catch (error) {
    failures.push(`API ${url} → ${error.message}`)
  }
}

console.log(`Frontend: ${FRONT_URL}`)
console.log(`API:      ${API_URL}`)
console.log('\nRutas SPA:')
for (const route of ROUTES) {
  await checkSpaRoute(route)
}

console.log('\nSeparación API / SPA:')
await checkApiNotSpa()

console.log('\nBackend:')
await checkApiHealth()

if (failures.length > 0) {
  console.error(`\n${failures.length} verificación(es) fallaron:`)
  for (const failure of failures) {
    console.error(`  - ${failure}`)
  }
  process.exit(1)
}

console.log('\nTodas las rutas y la API responden correctamente.')
