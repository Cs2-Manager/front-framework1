// Isolated FACEIT fixture API + deployed frontend.
// Playwright is a verification-only tool, not a production dependency.
// FACEIT_PLAYWRIGHT_MODULE, FACEIT_FIXTURE and FACEIT_SCREENSHOTS must be set.
import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import assert from 'node:assert/strict'

const { chromium } = await import(
  pathToFileURL(process.env.FACEIT_PLAYWRIGHT_MODULE).href
)
const fixture = JSON.parse(await readFile(process.env.FACEIT_FIXTURE, 'utf8'))
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const errors = []
page.on('pageerror', (error) => errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})

await page.route('**/api/**', async (route) => {
  const source = new URL(route.request().url())
  const response = await route.fetch({
    url: `http://127.0.0.1:5001${source.pathname}${source.search}`,
  })
  await route.fulfill({ response })
})
await page.addInitScript(
  (token) => localStorage.setItem('cs2_auth_token', token),
  fixture.token,
)

try {
  await page.goto('http://localhost/profile')
  await page.getByRole('heading', { name: 'FACEIT', exact: true }).waitFor()

  // Identidad verificada y procedencia explícita.
  await page.getByText('Verificado en FACEIT').first().waitFor()
  await page.getByText('Verificada con FACEIT Connect').waitFor()
  await page.getByText(/76561198000000001/).first().waitFor()
  await page.getByRole('link', { name: 'Ver perfil en FACEIT' }).waitFor()

  // Estadísticas reales, historial, mapas y ELO observado.
  await page.getByText('Estadísticas verificadas').waitFor()
  await page.getByText('120', { exact: true }).waitFor()
  await page.getByText('1.33', { exact: true }).waitFor()
  await page.getByText('de_mirage').first().waitFor()
  await page.getByText(/ELO actual/).waitFor()
  await page.getByText('2100', { exact: true }).first().waitFor()

  // La acción de sincronización está disponible solo para el dueño.
  assert(
    await page.getByRole('button', { name: 'Sincronizar FACEIT' }).isEnabled(),
    'El dueño debe poder sincronizar FACEIT',
  )

  // Banner de callback exitoso y de estado inválido.
  await page.goto('http://localhost/profile?faceit=linked')
  await page.getByText(/cuenta de FACEIT verificada correctamente/i).waitFor()
  await page.goto(
    'http://localhost/profile?faceit=error&reason=invalid_state',
  )
  await page.getByText(/venció o ya fue utilizada/i).waitFor()

  await page.goto('http://localhost/profile')
  await page.getByRole('heading', { name: 'FACEIT', exact: true }).waitFor()

  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.waitForTimeout(300)
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      `Horizontal overflow at ${width}px`,
    )
    await page.screenshot({
      path: `${process.env.FACEIT_SCREENSHOTS}/faceit-${width}.png`,
      fullPage: true,
    })
  }

  assert.deepEqual(errors, [], `Errores de navegador: ${errors.join(' | ')}`)
  console.log(
    'FACEIT browser verification OK: identity, stats, matches, maps, ELO, ' +
      'callback banners and 1440/768/390 layouts.',
  )
} finally {
  await browser.close()
}
