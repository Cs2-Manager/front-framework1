# FASE C.2 — Corrección de DBG en el frontend React

**Proyecto:** CS2 Manager — `front/`
**Fecha:** 2026-11-10
**Perfil aplicado:** `exigente` de `COMO-ESTIMAR-TUS-METRICAS-ALUMNOS.md`
**Base Git:** `2783fc9 fase 10` (sin commits ni push nuevos)
**Alcance:** `front/` completo (código de producción, tests y scripts de verificación)

---

## Resumen ejecutivo

Los 11 hallazgos DBG del inventario `front/docs/quality-c-session-final.json`
estaban todos en los tres scripts CLI de verificación del frontend. Ninguno era
depuración olvidada de la aplicación: eran mensajes de progreso, resultados de
comprobaciones y resúmenes finales que el script debe imprimir para una persona.

Se conservaron íntegramente los 11 mensajes, las comprobaciones, las assertions y
los códigos de salida. Para darles un canal coherente se creó una única capa de
salida CLI (`front/scripts/lib/cli-report.mjs`) con cuatro operaciones
semánticas: `info`, `ok`, `section` y `error`. Los scripts dejaron de llamar
directamente a `console.*` y pasaron a usar esa capa.

Resultado medido con el auditor local, mismo alcance de archivos y mismo
analizador:

| Señal | Antes | Después |
|---|---:|---:|
| **DBG** | **11** | **0** |
| DBG en `src/` (producción) | 0 | 0 |
| SEC | 1 | 1 |
| SQL | 9 | 9 |
| HTTP (archivos de componente) | 0 | 0 |
| Any | 0 | 0 |

No se borró ningún mensaje, no se excluyó ningún archivo, no se modificó el
analizador, no se cambiaron extensiones y no se alteró ninguna comprobación.

---

## 1. Documentación y diagnóstico

### 1.1 Documentos leídos

- `C:\Users\rnfac\Downloads\COMO-ESTIMAR-TUS-METRICAS-ALUMNOS.md` (guía oficial,
  versión 28/10/2026).
- `front/docs/FASE_C_METRICAS_REACT.md` (informe de la fase anterior; su
  sección DBG queda superada por este documento).
- `front/docs/quality-c-session-final.json` (inventario original de señales).
- `front/docs/quality-c2-baseline.json` (línea base de C.2, generada antes de
  tocar los scripts).
- `front/docs/quality-c2-final.json` (auditoría final de C.2).

### 1.2 Archivos inspeccionados

- `front/scripts/verify-faceit-browser.mjs`
- `front/scripts/verify-phase8-browser.mjs`
- `front/scripts/verify-spa-routes.mjs`
- `front/scripts/lib/cli-report.mjs` (nuevo)
- `scripts/audit_react_quality.cjs` (auditor local, fuera de `front/`; **no
  modificado** en esta fase)

### 1.3 Los 11 hallazgos originales

Los números de línea corresponden al estado anterior a la corrección, que es el
que registra la línea base.

| # | Archivo:línea | Sentencia original | Clasificación |
|---:|---|---|---|
| 1 | `scripts/verify-faceit-browser.mjs:83-86` | `console.log('FACEIT browser verification OK: identity, stats, matches, maps, ELO, ' + 'callback banners and 1440/768/390 layouts.')` | Resultado de una verificación |
| 2 | `scripts/verify-phase8-browser.mjs:81` | `console.log('Browser OK: library, strategy creation, lineup selection, marker save/reload, normalized persistence, preparation, private grenade creation, favorites, map lineup creation, history, comparison, 1440/768/390px layouts; no JS errors.')` | Resultado de una verificación |
| 3 | `scripts/verify-spa-routes.mjs:70` | ``console.log(`  ok  ${route}`)`` | Resultado de una verificación |
| 4 | `scripts/verify-spa-routes.mjs:87` | ``console.log(`  ok  /api/health no devuelve HTML (HTTP ${response.status})`)`` | Resultado de una verificación |
| 5 | `scripts/verify-spa-routes.mjs:105` | ``console.log(`  ok  API ${url}`)`` | Resultado de una verificación |
| 6 | `scripts/verify-spa-routes.mjs:111` | ``console.log(`Frontend: ${FRONT_URL}`)`` | Mensaje informativo legítimo |
| 7 | `scripts/verify-spa-routes.mjs:112` | ``console.log(`API:      ${API_URL}`)`` | Mensaje informativo legítimo |
| 8 | `scripts/verify-spa-routes.mjs:113` | `console.log('\nRutas SPA:')` | Mensaje informativo legítimo |
| 9 | `scripts/verify-spa-routes.mjs:118` | `console.log('\nSeparación API / SPA:')` | Mensaje informativo legítimo |
| 10 | `scripts/verify-spa-routes.mjs:121` | `console.log('\nBackend:')` | Mensaje informativo legítimo |
| 11 | `scripts/verify-spa-routes.mjs:132` | `console.log('\nTodas las rutas y la API responden correctamente.')` | Resultado de una verificación |

**Ninguno es “depuración olvidada”.** Tampoco hay advertencias ni errores
operativos entre los 11: los errores operativos de estos scripts usan
`console.error` (stderr) y el detector DBG no los cuenta porque solo busca
`console.log`, `console.debug`, `console.info`, `debugger;` y `print(`.

Los `console.error` que sí existen en los scripts también se centralizaron por
coherencia, aunque no formaban parte del inventario DBG:

- `verify-phase8-browser.mjs:83-84`: alertas visibles y errores JS.
- `verify-spa-routes.mjs:125,127`: listado de verificaciones fallidas.

### 1.4 Por qué son falsos positivos de la heurística

La señal DBG de la guía está pensada para detectar restos de depuración en el
código de la aplicación. En cambio, estos scripts **son** herramientas CLI: su
contrato es escribir progreso y resultados en la salida estándar para que una
persona (o un pipeline) los lea. Un `console.log` en `verify-spa-routes.mjs` no
es un resto de depuración: es la única forma prevista de comunicar el resultado
de la comprobación.

Se verificó además que ningún otro script o documento consume estos mensajes
como contrato de máquina: las referencias en `README.md`, `ETAPA4_INFORME.md` y
`front/docs/FASE_C_METRICAS_REACT.md` son documentales, no parsers. Aun así, se
mantuvo el texto exacto de todos los mensajes para no romper ninguna lectura
manual ni automatizada.

---

## 2. Corrección aplicada

### 2.1 Mecanismo: una capa única de salida CLI

Se creó `front/scripts/lib/cli-report.mjs`:

```js
import { format } from 'node:util'

export function info(...parts) {
  process.stdout.write(`${format(...parts)}\n`)
}

export function ok(message) {
  process.stdout.write(`  ok  ${message}\n`)
}

export function section(title) {
  process.stdout.write(`\n${title}\n`)
}

export function error(...parts) {
  process.stderr.write(`${format(...parts)}\n`)
}
```

Propiedades del mecanismo:

- **Un solo punto de salida** para las tres herramientas.
- **stdout para resultados** (`info`, `ok`, `section`) y **stderr para fallos**
  (`error`), igual que antes.
- **Formato idéntico** al de `console.log`/`console.error`: se usa
  `node:util.format`, que reproduce el formateo de Node para cadenas y objetos.
- **Prefijos centralizados**: `ok()` genera `  ok  ` y `section()` genera el
  salto de línea inicial, exactamente como estaban escritos antes.
- **Sin dependencias nuevas**: solo `node:util`.

Esto responde al punto 2.4 del encargo (“adoptar un mecanismo coherente de
salida para herramientas CLI cuando corresponda”) y evita que cada script
reimplemente su propio formato.

### 2.2 Cambios por hallazgo

| # | Antes | Después |
|---:|---|---|
| 1 | `console.log(...)` en `verify-faceit-browser.mjs` | `info(...)` con el mismo texto |
| 2 | `console.log(...)` en `verify-phase8-browser.mjs` | `info(...)` con el mismo texto |
| 3 | ``console.log(`  ok  ${route}`)`` | `ok(route)` |
| 4 | ``console.log(`  ok  /api/health no devuelve HTML (HTTP ${response.status})`)`` | ``ok(`/api/health no devuelve HTML (HTTP ${response.status})`)`` |
| 5 | ``console.log(`  ok  API ${url}`)`` | ``ok(`API ${url}`)`` |
| 6 | ``console.log(`Frontend: ${FRONT_URL}`)`` | ``info(`Frontend: ${FRONT_URL}`)`` |
| 7 | ``console.log(`API:      ${API_URL}`)`` | ``info(`API:      ${API_URL}`)`` |
| 8 | `console.log('\nRutas SPA:')` | `section('Rutas SPA:')` |
| 9 | `console.log('\nSeparación API / SPA:')` | `section('Separación API / SPA:')` |
| 10 | `console.log('\nBackend:')` | `section('Backend:')` |
| 11 | `console.log('\nTodas las rutas y la API responden correctamente.')` | `info('\nTodas las rutas y la API responden correctamente.')` |

Además, sin formar parte de los 11:

| Archivo | Antes | Después |
|---|---|---|
| `verify-phase8-browser.mjs` | `console.error('Visible alerts:', ...)` | `reportError('Visible alerts:', ...)` |
| `verify-phase8-browser.mjs` | `console.error('JS errors:', errors)` | `reportError('JS errors:', errors)` |
| `verify-spa-routes.mjs` | `console.error` del resumen de fallos | `reportError` del mismo resumen |

`reportError` es el alias importado de `error` para no colisionar con los
parámetros `catch (error)` que ya existían en los scripts.

### 2.3 Qué no se tocó

- **No se eliminó ningún mensaje.** El texto visible es el mismo.
- **No se alteró ninguna comprobación ni assertion** (`assert.deepEqual`,
  comprobaciones de estado, content-type, HTML de la SPA, JSON de health,
  capturas, selectores, etc.).
- **No se modificaron los códigos de salida**: `0` en éxito y `1` en fallo.
- **No se excluyó ningún script** ni se cambiaron extensiones.
- **No se modificó el analizador** `scripts/audit_react_quality.cjs`.
- **No se tocó Flask, NestJS, PostgreSQL, secretos, volúmenes, APIs ni
  configuraciones de seguridad.**
- **No se eliminaron tests** ni se cambió su configuración.
- **No se hizo un reemplazo línea a línea** `console.log` → `process.stdout.write`.
  Se introdujo un módulo con contrato propio y se sustituyeron las llamadas por
  operaciones semánticas (`info`/`ok`/`section`/`error`).

### 2.4 Transparencia sobre el detector

La métrica DBG del auditor cuenta líneas que contienen `console.log`,
`console.debug`, `console.info`, `debugger;` o `print(`. Al centralizar la
salida, las líneas de los scripts ya no contienen esos patrones y la señal baja
a 0.

Esto **no oculta depuración real**: los 11 mensajes siguen existiendo y siguen
imprimiéndose. Lo que cambia es que ahora hay un único sink documentado para
toda la salida CLI. Si en el futuro se añade un mensaje de depuración temporal
en un script, seguirá siendo visible en el diff y en la revisión de código; la
métrica no pretende sustituir esa revisión.

Si el criterio oficial se ampliara algún día a “cualquier escritura en stdout”,
las cuatro escrituras de `cli-report.mjs` serían el único punto a revisar; no
son depuración, son el sink de la herramienta. Con el criterio vigente, el
alcance completo queda en DBG = 0.

---

## 3. Comprobación de DBG

### 3.1 Comando

```powershell
node scripts/audit_react_quality.cjs front/docs/quality-c2-final.json
```

### 3.2 Resultado

| Métrica | Línea base | Final |
|---|---:|---:|
| Archivos analizados | 349 | 350 |
| Archivos de test | 90 | 90 |
| LOC no vacías | 24.324 | 24.348 |
| Líneas normalizadas | 15.352 | 15.360 |
| **DBG** | **11** | **0** |
| SEC | 1 | 1 |
| SQL | 9 | 9 |
| HTTP (archivos de componente) | 0 | 0 |
| Any | 0 | 0 |
| BigC producción | 1 | 1 |
| BigC tests | 9 | 9 |
| Complejas | 166 | 166 |
| Duplicación | 9,2431 % | 9,2383 % |
| Peso | 2.028,86 | 2.006,86 |
| Índice estimado | 2 | 2 |

El archivo adicional y las 24 LOC corresponden exactamente al nuevo
`scripts/lib/cli-report.mjs` (25 líneas, 24 no vacías). No hay archivos
excluidos ni cambios de alcance.

### 3.3 DBG en producción

Se comprobó explícitamente que `front/src/` sigue sin coincidencias:

```powershell
Get-ChildItem front\src -Recurse -Include *.js,*.jsx,*.ts,*.tsx |
  Where-Object { $_.Name -notmatch '\.(test|spec)\.' } |
  Select-String -Pattern "console\.(log|debug|info)\s*\(|debugger\s*;"
```

Resultado: **sin coincidencias**.

### 3.4 Hallazgos residuales

- **DBG: 0.** No quedan coincidencias en el alcance evaluado.
- SEC y SQL siguen en 1 y 9 respectivamente; son falsos positivos ya
  identificados y fuera del alcance de C.2 (ver §7).

---

## 4. Pruebas ejecutadas

Todas las pruebas se ejecutaron desde `front/`, salvo el auditor, que se ejecuta
desde la raíz del repositorio.

### 4.1 Vitest completo

```powershell
npm test
```

Resultado:

- **88 suites aprobadas / 88**
- **473 tests aprobados / 473**
- Sin fallos ni tests omitidos.

### 4.2 Vitest con cobertura

```powershell
npm run test:coverage
```

| Métrica | Cobertura | Cubierto / total |
|---|---:|---:|
| Líneas | **83,12 %** | 2.577 / 3.100 |
| Statements | 79,10 % | 2.835 / 3.584 |
| Branches | 70,00 % | 2.355 / 3.364 |
| Funciones | 74,92 % | 998 / 1.332 |

El umbral configurado en `front/vite.config.js` es `lines: 80`, por lo que se
supera. No se añadieron exclusiones ni se cambió la configuración de cobertura.

### 4.3 Build React

```powershell
npm run build
```

Resultado:

- **367 módulos transformados.**
- `dist/index.html` 0,40 kB; CSS 127,42 kB; JS 609,34 kB (gzip 176,66 kB).
- Aviso de chunk > 500 kB **preexistente**, no introducido por C.2.
- Build completado correctamente.

### 4.4 `verify:routes` — camino de éxito

```powershell
npm run verify:routes
```

Resultado:

- 21 rutas SPA comprobadas: todas `ok`.
- Separación API/SPA: `/api/health` no devuelve HTML (HTTP 200).
- Backend: `http://localhost/api/health` responde y parsea como JSON.
- Mensaje final: “Todas las rutas y la API responden correctamente.”
- **Exit code: 0.**
- La salida de texto es idéntica a la anterior (mismos encabezados, mismos
  prefijos `  ok  ` y mismas líneas).

Se comprobó **byte a byte** ejecutando la versión de `HEAD` y la versión nueva
contra el mismo despliegue: stdout y stderr fueron idénticos (mismo hash
SHA-256), con exit 0 en ambos casos.

### 4.5 `verify:routes` — camino de fallo

Se forzó un destino inexistente:

```powershell
$env:FRONT_URL='http://127.0.0.1:59999'
$env:API_URL='http://127.0.0.1:59999/api'
node scripts/verify-spa-routes.mjs
```

Resultado:

- **Exit code: 1.**
- Progreso y encabezados en **stdout**.
- **23 verificaciones fallidas** listadas en **stderr** (21 rutas, health de la
  SPA y health de la API), con el mismo formato `  - ...`; el archivo de error
  tiene 25 líneas (encabezado + 23 fallos + separación).
- Se confirma que el cambio de sink no silencia fallos ni altera el código de
  salida.
- La comparación con la versión de `HEAD` también fue **byte a byte**:
  stdout y stderr idénticos, exit 1 en ambos casos.

También se probó el módulo de forma aislada:

```powershell
node --input-type=module -e "import { info, ok, section, error } from './front/scripts/lib/cli-report.mjs'; info('info', 1); ok('ok-line'); section('Section'); error('err', [1,2])"
```

Resultado: `info`/`ok`/`section` en stdout, `error` en stderr, exit 0.

### 4.6 Scripts de navegador

```powershell
node --check front/scripts/verify-faceit-browser.mjs
node --check front/scripts/verify-phase8-browser.mjs
node --check front/scripts/verify-spa-routes.mjs
node --check front/scripts/lib/cli-report.mjs
```

Resultado: sintaxis correcta en los cuatro archivos.

**Limitación documentada:** `verify-faceit-browser.mjs` y
`verify-phase8-browser.mjs` **no se ejecutaron** porque requieren:

- `FACEIT_PLAYWRIGHT_MODULE` / `PLAYWRIGHT_MODULE` (Playwright),
- `FACEIT_FIXTURE` / `PHASE8_FIXTURE` (fixtures JSON),
- `FACEIT_SCREENSHOTS` / `PHASE8_SCREENSHOTS` (directorios de capturas),
- una API fixture escuchando en `http://127.0.0.1:5001`,
- el frontend desplegado en `http://localhost`.

Ninguno de esos recursos está disponible en este entorno. El diff demuestra que
el único cambio en esos dos scripts es el sink de salida (`console.log` →
`info`, `console.error` → `reportError`); las comprobaciones, esperas,
selectores, capturas y assertions son idénticas. No se declara una ejecución
que no se ha hecho.

### 4.7 Auditor local

```powershell
node scripts/audit_react_quality.cjs --self-test
```

Resultado: **4 comprobaciones aprobadas** (unión de solapamientos, incidencia de
solapamientos, límites entre archivos, normalización JSX/comentarios/imports).

La auditoría final se ejecutó con el mismo analizador y el mismo alcance que la
línea base; no se modificó `scripts/audit_react_quality.cjs`.

---

## 5. Métricas que podrían haber cambiado

| Métrica | Efecto de C.2 | Comentario |
|---|---|---|
| DBG | **11 → 0** | Objetivo de la fase. |
| Archivos | 349 → 350 | Nuevo `scripts/lib/cli-report.mjs`. |
| LOC no vacías | 24.324 → 24.348 | +24 líneas del módulo. |
| Duplicación | 9,2431 % → 9,2383 % | Baja ligeramente; no aumenta. |
| Peso | 2.028,86 → 2.006,86 | Baja por la reducción de DBG. |
| Índice estimado | 2 → 2 | Sin cambio. |
| SEC / SQL / HTTP / Any | Sin cambio | 1 / 9 / 0 / 0. |
| BigC producción | Sin cambio | 1. |
| Complejas | Sin cambio | 166. |
| Cobertura | Sin cambio | 83,12 % de líneas. |

No aparecen nuevos hallazgos SEC, HTTP ni Any. La duplicación no aumenta.

---

## 6. Archivos modificados

### 6.1 Nuevos

| Archivo | Descripción | SHA-256 |
|---|---|---|
| `front/scripts/lib/cli-report.mjs` | Capa única de salida CLI (`info`, `ok`, `section`, `error`). | `af270f8710bf1f4c78e7e6b0780e0e9595086ce1837fed0fb7606c9f1b5924ae` |
| `front/docs/quality-c2-baseline.json` | Evidencia de la línea base (DBG 11). | — |
| `front/docs/quality-c2-final.json` | Evidencia de la auditoría final (DBG 0). | — |
| `front/docs/FASE_C2_DBG_REACT.md` | Este informe. | — |

### 6.2 Modificados

| Archivo | Cambio | SHA-256 |
|---|---|---|
| `front/scripts/verify-spa-routes.mjs` | 9 hallazgos + `console.error` → `cli-report`. | `5301803f203593851dd1ae2607821ed658b22db7feb7e0d95d63a64d4e77c4da` |
| `front/scripts/verify-faceit-browser.mjs` | 1 hallazgo → `info`. | `99ee9c305ed28f83119eeb85920ab36759b310ecac2fa775999b7ff5c8c1336b` |
| `front/scripts/verify-phase8-browser.mjs` | 1 hallazgo + 2 `console.error` → `cli-report`. | `901859a05f88a9df77a1bc5e228580f8d8a10256543712448fbffd840acf4ae7` |

`front/package.json` ya estaba modificado antes de C.2 (dependencia de cobertura
añadida por la sesión anterior); esta fase no lo tocó.

No se modificó ningún archivo fuera de `front/`. El auditor
`scripts/audit_react_quality.cjs` quedó intacto.

---

## 7. Falsos positivos pendientes (fuera de C.2)

Estos hallazgos **no** son DBG y no se han tocado, pero se documentan para que
no se confundan con regresiones.

### 7.1 SEC = 1

`src/components/auth/authValidation.js:30`

```js
errors.confirmPassword = 'Las contraseñas no coinciden.'
```

La heurística SEC busca `password` seguido de `=` y una cadena de 6+ caracteres.
Aquí se asigna un **mensaje de error de validación** a una propiedad llamada
`confirmPassword`; no hay ningún secreto. Es un falso positivo.

### 7.2 SQL = 9

Las nueve coincidencias son llamadas HTTP `api.delete(...)` con plantillas
JavaScript:

- `src/services/grenadeLineups.js:76,160`
- `src/services/lineups.js:22`
- `src/services/maps.js:24,44`
- `src/services/tactics.js:6`
- `src/services/teams.js:61,65`

Ejemplo:

```js
await api.delete(`/grenade-lineups/${lineupId}`)
```

La heurística SQL busca palabras como `delete` en una línea que además contiene
`${`; interpreta el método HTTP `DELETE` como una consulta SQL. No hay SQL en
el frontend. Son falsos positivos.

---

## 8. Confirmación de no regresiones

- **Mensajes:** los 11 textos se conservan literalmente; la salida de
  `verify:routes` es idéntica a la anterior.
- **Comprobaciones:** ninguna assertion, espera, selector ni comprobación de
  estado fue alterada.
- **Códigos de salida:** éxito `0`, fallo `1`; verificado en ambos caminos.
- **Errores:** siguen yendo a stderr, con el mismo contenido y formato.
- **Tests:** 88 suites / 473 tests aprobados; no se eliminó ni omitió ninguno.
- **Cobertura:** 83,12 % de líneas, por encima del umbral del 80 %.
- **Build:** correcto, 367 módulos; el aviso de tamaño de chunk es preexistente.
- **Métricas:** DBG 11 → 0; SEC, SQL, HTTP, Any, BigC, complejidad y cobertura sin
  cambios; duplicación sin aumento.
- **Alcance:** mismo analizador, mismas reglas, sin exclusiones ni cambios de
  extensión.
- **Backend y datos:** Flask, NestJS, PostgreSQL, secretos, volúmenes y APIs sin
  cambios.
- **Git:** sin commits ni push; solo cambios de trabajo en `front/`.

---

## 9. Conclusión

Los 11 hallazgos DBG eran **falsos positivos** de la heurística aplicada a
herramientas CLI: mensajes operativos legítimos, no depuración de la aplicación.
Se conservaron todos, se les dio un mecanismo de salida coherente y se demostró
que la señal DBG baja a 0 en el alcance completo sin borrar mensajes, sin alterar
comprobaciones y sin manipular el analizador.

La calidad del código mejora porque la salida de las tres herramientas queda
centralizada y separada por canal (resultados en stdout, fallos en stderr), y
porque cualquier cambio futuro de formato se hace en un único sitio.
