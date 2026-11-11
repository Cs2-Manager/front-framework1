// Verification-only. Uses real read-only Flask endpoints and rejects unauthenticated
// Nest sockets; the positive login/logout UI flow below explicitly uses API fixtures.
import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'
import { createServer } from 'vite'
import { io } from 'socket.io-client'

const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href)
const flask = process.env.FLASK_URL || 'http://127.0.0.1:5000'
const nest = process.env.NEST_URL || 'http://127.0.0.1:3000'
const vite = await createServer({
  server: { host: '127.0.0.1', port: 0, proxy: {
    '/api': flask,
    '/realtime/socket.io': { target: nest, ws: true },
    '/realtime/health': { target: nest, rewrite: () => '/health' },
  } },
})
await vite.listen()
const base = `http://127.0.0.1:${vite.httpServer.address().port}`
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const page = await browser.newPage()
const errors = []
page.on('pageerror', error => errors.push(error.message))

try {
  await page.goto(base)
  await page.getByRole('heading', { name: 'Tu centro de entrenamiento competitivo' }).waitFor()
  const players = page.waitForResponse(r => new URL(r.url()).pathname === '/api/players')
  await page.goto(`${base}/players`)
  assert.equal((await players).status(), 200)
  await page.getByRole('heading', { name: 'Jugadores', exact: true }).waitFor()
  await page.goto(`${base}/maps`)
  await page.waitForURL('**/login')
  assert.equal(await page.evaluate(() => localStorage.getItem('cs2_auth_token')), null)
  assert.equal((await page.request.get(`${base}/api/health`)).status(), 200)
  assert.equal((await page.request.get(`${base}/realtime/health`)).status(), 200)

  // No credentials, data creation or signed writes against the deployed services.
  const socket = io(nest, { path: '/realtime/socket.io', transports: ['websocket'],
    reconnection: false, extraHeaders: { Origin: 'http://localhost' }, timeout: 5000 })
  try {
    const error = await new Promise((resolve, reject) => {
      socket.once('connect_error', resolve)
      socket.once('connect', () => reject(new Error('Unauthenticated socket accepted')))
    })
    assert.equal(error.data?.code, 'AUTH_MISSING_TOKEN')
  } finally { socket.disconnect() }

  const user = { id: 987654, username: 'phase-c-fixture', is_admin: false }
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname
    let data = {}
    let status = 200
    if (path === '/api/auth/login') data = { token: 'phase-c-fixture-token', user }
    else if (path === '/api/auth/me') data = { user }
    else if (path === '/api/maps') data = { maps: [], meta: { total: 0 } }
    else if (path === '/api/notifications') data = { notifications: [], unread_count: 0, meta: { total: 0 } }
    else if (path.startsWith('/api/teams/')) { status = 403; data = { error: 'Este equipo es privado.' } }
    return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) })
  })
  await page.getByLabel('Email', { exact: true }).fill('fixture@example.test')
  await page.getByLabel('Contraseña', { exact: true }).fill('fixture-password')
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click()
  await page.waitForURL('**/maps')
  await page.getByRole('button', { name: 'Menú de phase-c-fixture' }).waitFor()
  assert.equal(await page.getByRole('button', { name: 'Nuevo mapa', exact: true }).count(), 0)
  await page.goto(`${base}/teams/99/edit`)
  await page.getByText('Este equipo es privado.', { exact: true }).waitFor()
  assert.equal(await page.getByRole('button', { name: 'Guardar cambios', exact: true }).count(), 0)
  await page.getByRole('button', { name: 'Menú de phase-c-fixture' }).click()
  await page.getByRole('button', { name: 'Cerrar sesión', exact: true }).first().click()
  await page.waitForURL('**/login')
  assert.equal(await page.evaluate(() => localStorage.getItem('cs2_auth_token')), null)
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(base)
    await page.getByRole('heading', { name: 'Tu centro de entrenamiento competitivo' }).waitFor()
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
  }
  assert.deepEqual(errors, [])
  console.log('PASS: real Flask public read + health, real Nest missing-token rejection; fixture login/logout, protected navigation, denied team edit, non-admin controls, responsive landing, no JS exceptions.')
} finally {
  await browser.close()
  await vite.close()
}
