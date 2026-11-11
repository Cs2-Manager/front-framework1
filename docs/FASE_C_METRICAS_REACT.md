# CS2 Manager — Fase C: auditoría y correcciones React

Fecha: 2026-11-10. Unidad: **`front/` como repositorio independiente**.
Perfil exclusivo: **exigente**, guía del 28/10/2026.

**Cierre parcial, sin aprobación oficial.** Se corrigieron fallos reales de
aislamiento de sesión y dos imports que impedían arrancar la aplicación.
Duplicación y cobertura cumplen localmente; **índice, BigC, complejidad y DBG
del alcance completo no cumplen**. No se dividieron tests ni se cambiaron
extensiones/exclusiones para mejorar el resultado.

## 1. Medición inicial reproducible

Se leyeron completamente la guía, `ETAPA4_INFORME.md`, los informes de etapas
2/3, el informe B.1 de NestJS y los scripts de auditoría/verificación existentes.
La línea base nueva se ejecutó **antes de modificar código de producción**,
incluyendo una ejecución completa de cobertura antes del primer refactor.

El directorio ya contenía numerosos cambios sin commit y los snapshots
`quality-c-initial.json`, `quality-c-after-grenade.json` y `quality-c-tmp.json`.
Se preservaron: **no son resultados ni autoría de esta ejecución**.
En particular, los 29 BigC/30,31 %/74,27 %/348 tests son antecedentes con otro
estado/alcance, no la línea base actual. El snapshot histórico
`quality-c-initial.json` tampoco equivale al inicial de esta sesión.

| Inventario | Inicial de sesión | Final de sesión |
|---|---:|---:|
| Archivos de código | 344 | 349 |
| LOC no vacías, incluidos tests | 24.087 | 24.324 |
| Líneas normalizadas para duplicación | 15.165 | 15.352 |
| Funciones/callbacks detectados | 2.375 | 2.411 |
| Clases detectadas | 0 | 0 |
| Archivos clasificados como test por auditor | 86 | 90 |
| Vistas/componentes reconocidos | 275 | 278 |

Evidencias: `quality-c-session-initial.json` y `quality-c-session-final.json`.
Contienen inventario completo con SHA256 por archivo, funciones con rango,
parámetros/complejidad/tamaño, clases, señales, ventanas y líneas duplicadas.
Los 90 archivos de test del auditor incluyen setup y navegador: **no son 90
suites Vitest**.

El auditor existente `../scripts/audit_react_quality.cjs` no se modificó.
Analiza únicamente código de `front/`, incluidos `scripts/` y tests; excluye
dependencias, compilados, coverage, configuraciones de herramientas y archivos
de más de 1 MB. No incluye backend, CSS, HTML ni documentación en el denominador.
Su descripción de alcance en JSON abrevia el recorrido: el inventario `files`
es la referencia efectiva. Usa AST TypeScript para localizar funciones y regex
para sus ramas; no es el extractor oficial. Las ramas de callbacks anidados,
JSX, optional chaining y palabras dentro de strings pueden acumularse.

Reproducción desde `D:\back-y-front`:

```powershell
node scripts/audit_react_quality.cjs --self-test
node scripts/audit_react_quality.cjs front/docs/quality-c-session-reproduced.json
```

Autocomprobaciones aprobadas: unión de solapamientos, incidencias superpuestas,
límites entre archivos y normalización JSX/comentarios/imports.
El auditor está fuera de la unidad y necesita TypeScript de
`realtime/node_modules`: **su distribución autónoma dentro del repositorio
frontend queda pendiente**. No se ha probado una clonación limpia de GitHub
`main` ni el evaluador docente. Se midió el working tree local, no lo publicado.

## 2. Los 15 criterios

Los límites normalizados se calculan con `floor(LOC/1000 × tasa)`; BigC cuenta
archivos JSX completos no vacíos, incluidos comentarios y tests.

| # | Criterio / exigencia | Inicial | Final | Resultado local final |
|---|---|---:|---:|---|
| 1 | Índice ≥ 60 | 2 | 2 | No cumple |
| 2 | Duplicación ≤ 15 % | 9,449390 % | 9,243095 % | Cumple |
| 3 | SEC = 0 | 1 crudo / 0 revisado | 1 crudo / 0 revisado | Cumple tras revisión; regex pendiente |
| 4 | SQL = 0, solo backend | 9 crudos | 9 crudos | No aplicable a frontend |
| 5 | Capas ≥ 2 con ≥ 150 LOC | 3 | 3 | Cumple |
| 6 | HTTP en componentes = 0 | 0 | 0 | Cumple |
| 7 | DBG = 0 | 11 | 11 | No cumple en alcance completo; `src/` = 0 |
| 8 | Any ≤ 2 archivos con ≥ 3 usos | 0 | 0 | Cumple |
| 9 | BigC ≤ 1 archivo | 11 | 10 | No cumple |
| 10 | Coh = 0 clases afectadas | 0 | 0 | Sin clases elegibles |
| 11 | Compl ≤ 5/1000 LOC | 163 / máx. 120 | 166 / máx. 121 | No cumple |
| 12 | Tam ≤ 10/1000 LOC | 234 / máx. 240 | 237 / máx. 243 | Cumple |
| 13 | Acop ≤ 2/1000 LOC | 0 / máx. 48 | 0 / máx. 48 | Sin clases; cumple contador |
| 14 | Cobertura de líneas ≥ 80 % | 82,43 % | 83,12 % | Cumple |
| 15 | Vistas ≥ 8 | 275 | 278 | Cumple contador heurístico |

**Revisión de señales, sin ocultar los resultados originales:**

- SEC: `src/components/auth/authValidation.js:30` contiene
  `errors.confirmPassword = 'Las contraseñas no coinciden.'`: es un mensaje de
  validación, no una contraseña. Se conservó sin renombrar para esquivar regex.
- SQL: los nueve matches son rutas HTTP interpoladas/`api.delete`, en
  `grenadeLineups.js` (76,160), `lineups.js` (22), `maps.js` (24,44),
  `tactics.js` (6), `teams.js` (61,65) y `workshopMaps.js` (32), bajo
  `src/services/`. No son consultas SQL; el criterio solo aplica a backend.
- DBG: dos líneas de `scripts/verify-faceit-browser.mjs:83` y
  `verify-phase8-browser.mjs:81`, más nueve de `verify-spa-routes.mjs`
  (70,87,105,111,112,113,118,121,132). Son salidas operativas preexistentes,
  no logs de la aplicación. Siguen contándose; no se sustituyeron por stdout
  para engañar al detector ni se excluyeron scripts.
- Capas: vistas (`components`, `pages`), servicios (`services`) y estado
  (`context`, `hooks`). Reconocimiento por nombres, no prueba completa de arquitectura.
- Las 278 vistas incluyen tests/helpers en carpetas reconocidas por §4.7;
  no equivalen a 278 pantallas navegables. Inventario exacto reconstruible
  mediante `files` y la regla de vistas del auditor.

## 3. Inventario completo BigC inicial y decisión por archivo

Todos los valores siguientes son líneas **no vacías**, no líneas físicas.
En suites, negocio/estado/renderizado son comportamientos del objeto bajo
prueba; fixtures, mocks y assertions no constituyen estado de producción.
No se propone extraer hooks de tests. Los componentes indicados son también
los objetos de prueba relacionados; cada suite se prueba a sí misma con Vitest.

| Archivo relativo a `front/` | Inicial → final | Responsabilidades, negocio/estado/renderizado/validación | Extracción considerada y riesgo |
|---|---:|---|---|
| `src/pages/TeamDetail.test.jsx` | 402 → 402 | Equipo público/privado, roster, invitaciones, permisos, acciones/errores y actividad; fixtures de auth/realtime | Separar por dominios sería posible, pero no se fragmentó para BigC. Alto riesgo de perder regresiones de privacidad |
| `src/components/matchmaking/MatchmakingSection.test.jsx` | 370 → 370 | Propietario/visitante, códigos Steam inválidos, sincronización, demos, historial, revocación y mensajes; mocks de peticiones | Conservar integración de estados y controles. Alto riesgo en autorización y procesamiento |
| `src/context/RealtimeContext.test.jsx` | 341 → 341 | Socket autenticado, presencia, actividad, historial, limpieza de sesión y eventos; socket simulado | Separación REST/socket ya existía en producción. No se dividió suite. Alto riesgo de fugas entre sesiones/equipos |
| `src/pages/TeamLineupDetail.test.jsx` | 313 → 313 | Alineación, titularidad, edición/activación, roster, restricciones y errores; hooks de equipo/lineup simulados | Conservar flujo integrado; sin nuevos hijos/hooks. Alto riesgo de permisos y estado de alineación |
| `src/components/layout/NotificationBell.test.jsx` | 273 → 273 | Contador, lecturas, carga/error/vacío, paginación, navegación, Escape y texto no interpretado como HTML | Mantener regresiones del panel accesible; no fragmentar. Alto riesgo de lectura involuntaria/XSS/navegación |
| `src/pages/TeamLineups.test.jsx` | 265 → 265 | Listado, creación, titularidad, acciones y permisos; datos/hooks simulados | Mantener escenarios conectados. Alto riesgo en permisos/acciones sobre equipo |
| `src/components/faceit/FaceitSection.test.jsx` | 245 → 245 | Descubrimiento, vínculo, OAuth, sincronización/desvínculo y errores; cuenta/stats simulados | Suite existente conservada; complementada por tests pequeños de la tarjeta. Alto riesgo en identidad/propiedad |
| `src/components/profile/ProfileView.test.jsx` | 207 → 207 | Perfil vacío/completo, formato/estadísticas y privacidad de dueño/visitante; fixtures de datos | No extraer componentes desde tests; mantener assertions de datos visibles. Alto riesgo de privacidad |
| `src/components/profile/icons.jsx` | 192 → 192 | Catálogo SVG cohesivo; solo renderizado, sin negocio, estado ni validaciones | Sin hook útil; cada icono ya es un componente. No repartir arbitrariamente catálogo para el límite. Riesgo bajo de negocio, visual/de imports |
| `src/components/teams/TeamActivityFeed.test.jsx` | 179 → 179 | Actividad histórica/en vivo, deduplicación, paginación, errores y cambio de equipo; fixtures de eventos | Mantener escenarios de aislamiento y combinación; no dividir. Riesgo alto de mostrar eventos ajenos |
| `src/components/faceit/FaceitLinkCard.jsx` | 155 → 106 | Antes: discovery/link/OAuth, cinco estados, errores, permisos `claimed`, preview y botones | Extraído `useFaceitDiscovery.js` (51 no vacías). Tarjeta conserva renderizado/preview; tests `FaceitSection` + nueva `FaceitLinkCard`. Riesgo alto controlado con 13 tests relacionados |

Final: **1 archivo de producción + 9 tests = 10**. El hook nuevo no contiene
JSX y mide 51 líneas no vacías: la extracción responde a peticiones/estado,
no a un cambio de extensión del renderizado. La nueva suite de tarjeta mide
51 y la de formulario 21; ningún JSX nuevo alcanza 150.
No se atribuyen a esta sesión las descomposiciones ya presentes al comenzar.

## 4. Duplicación inicial y final

Se quitan comentarios/imports/líneas sin lógica y se normalizan espacios.
Las ventanas son de cinco líneas normalizadas **dentro de cada archivo**.
Cada línea afectada se une por clave `archivo:línea`, aunque pertenezca a varias
ventanas. Los JSON guardan hashes de ventanas, ocurrencias y líneas originales.

| Etapa | Únicas / normalizadas | Porcentaje | Grupos de ventanas | Incidencias con solapamiento |
|---|---:|---:|---:|---:|
| Inicial | 1.433 / 15.165 | 9,449390 % | 290 | 3.270 |
| Grupo 1 FACEIT | 1.423 / 15.206 | 9,358148 % | 289 | 3.260 |
| Grupo 2 antes de compartir preparación de tests | 1.437 / 15.274 | 9,408145 % | 292 | 3.290 |
| Grupo 2 con preparación compartida + navegador | 1.419 / 15.337 | 9,252135 % | 287 | 3.240 |
| Final con regresión del formulario | 1.419 / 15.352 | 9,243095 % | 287 | 3.240 |

En el grupo 2 se detectó el pequeño incremento frente al grupo 1 y se compartió
la preparación realmente repetida en la nueva suite de notificaciones; las
assertions y cuatro escenarios se conservaron. El resultado final queda por
debajo de ambos grupos anteriores y de la línea base.

Contar incidencias en lugar de líneas únicas produciría **21,562809 % inicial**
y **21,104742 % final** con esta misma normalización. Esto demuestra el sesgo
del solapamiento, pero **no explica por sí solo** el 30,31 % histórico: también
cambiaron código/alcance. No se inventa una equivalencia entre estados distintos.
Inicialmente 733 líneas duplicadas estaban en tests y 700 fuera de ellos.
La duplicación ya cumplía: **no se refactorizó producción por duplicación**.

## 5. Bloques corregidos

1. **Sesiones de notificaciones:** las respuestas/error de `markRead` y
   `markAllRead` podían escribir sobre el estado después de logout/cambio de
   sesión. Se agregó generación `sessionRef`, incrementada por `reset`, y se
   verifica tras cada await tanto en éxito como en error. Cuatro regresiones
   fallaron antes y pasaron después. No cambia contratos REST ni visibilidad.
2. **401 tardío:** el interceptor cerraba la sesión actual por cualquier 401,
   incluso de petición anónima o con token anterior. Solo notifica expiración
   si el `Authorization` del pedido fallido coincide con el token actual.
   Dos nuevas regresiones fallaron antes y pasaron después. El caso existente
   de expiración vigente se conserva con cabecera autenticada realista.
3. **Imports del formulario:** navegador real falló al cargar
   `GrenadeMediaFields`; el build confirmó dos `MISSING_EXPORT`. Se cambiaron
   a imports nombrados en `GrenadeFormFields` y `GrenadeFormModal`, según sus
   exports reales, y se quitó un import sin uso. No se tocaron APIs.
4. **Dependencia vulnerable:** `npm audit --omit=dev --json` detectó
   `follow-redirects` transitivo, severidad alta. `npm audit fix --ignore-scripts`
   reparó ocho paquetes compatibles, sin `--force`; auditoría final: cero
   vulnerabilidades conocidas. Vite instalado pasó de 8.2.2 a 8.3.7.
   Esto no modifica la señal SEC heurística ni garantiza ausencia de fallos.

## 6. Componentes refactorizados

Solo `FaceitLinkCard` se descompuso en esta sesión: peticiones discovery/link/
OAuth, estados y mensajes quedan en `useFaceitDiscovery`; preview, botones,
cuenta reclamada y avisos siguen en JSX. Se preservan callbacks `onChange`,
URL OAuth, errores, disabled/loading y servicios existentes.

Después del grupo: 2 suites/13 tests relacionados aprobados y cobertura completa
86 suites/466 tests, 82,55 % de líneas. BigC pasó 11 → 10. No se modificaron
simultáneamente todos los componentes grandes ni se repartió el catálogo SVG.

## 7. Cobertura inicial y final

Alcance explícito: **todo `src/**/*.{js,jsx}` de producción**, excluyendo solo
tests `*.test`/`*.spec` y `src/test/**` (setup). `App.jsx` y `main.jsx` permanecen
incluidos aun con cobertura cero. No se excluyeron módulos difíciles ni se
incluyó la cobertura de navegador como si fuera cobertura Vitest.
`vite.config.js` fija V8 y umbral mínimo de **80 % de líneas**;
`package.json` agrega `test:coverage`.

| Medición ejecutada | Suites / tests aprobados | Líneas cubiertas / total | Líneas % | Archivos producción |
|---|---:|---:|---:|---:|
| Inicial, antes de cambios | 85 / 462 | 2.548 / 3.091 | 82,43 % | 255 |
| Grupo 1 | 86 / 466 | 2.551 / 3.090 | 82,55 % | 256 |
| Final | 88 / 473 | 2.577 / 3.100 | 83,12 % | 256 |

Resúmenes inicial/grupo 1 preservados en `coverage-c-session-initial.json` y
`coverage-c-session-step1.json`; final en `coverage-c-session-final.json`.
Se verificó el conjunto de archivos instrumentados contra producción: **256/256,
sin faltantes ni archivos inesperados**. Artefactos finales en
`../coverage/coverage-summary.json` y `../coverage/lcov.info`.
Las líneas instrumentadas de V8 no son las LOC no vacías del auditor.

El final también mide 79,10 % de statements, 70 % de ramas y 74,92 % de funciones;
el criterio exigido es **líneas**, no esos otros porcentajes.

Los servicios históricos de baja cobertura **ya tenían tests preexistentes**
y conservan sus valores iniciales al final:

| Servicio en `src/services/` | Cobertura inicial real de líneas |
|---|---:|
| `notifications.js` | 9/9 = 100 % |
| `tactics.js` | 9/9 = 100 % |
| `workshopMaps.js` | 10/10 = 100 % |
| `teamActivity.js` | 3/3 = 100 % |

No se atribuye esa cobertura a nuevos tests de esta ejecución. Persisten huecos
en la entrada de aplicación y otras áreas, aunque el total supere el umbral.

## 8. Tests nuevos

**11 casos adicionales**, sin borrar casos anteriores:

- `FaceitLinkCard.test.jsx`: cuatro casos de carga/reintento, cuenta ajena
  reclamada sin acción de vínculo, error de vínculo sin `onChange` y error OAuth
  con recuperación del botón. Se mantienen los escenarios existentes de éxito.
- `useNotificationHistory.test.js`: cuatro casos parametrizados; éxito tardío
  de lectura individual/global después de otra sesión, y error tardío
  individual/global tras logout; verifican contador, contenido y errores.
- `api.test.js`: dos casos de 401 previo/anónimo que no invalidan token nuevo;
  se conserva expiración válida, baseURL, cabeceras y rechazo del error.
- `GrenadeFormModal.test.jsx`: un caso con módulos hijos **reales** que abre el
  diálogo, agrega, edita y quita un medio; detecta imports incompatibles que
  los mocks previos no exponían.

Adicionalmente, `test/browser/phase-c.mjs` ejecuta assertions en Edge real,
fuera de Vitest y del porcentaje de cobertura.

## 9. Cohesión

Cero clases detectadas y cero elegibles en ambos snapshots. No hay clases con
≥ 4 métodos y ≥ 3 campos sobre las que calcular pares compartidos < 50 %.
Por ello Coh = 0 **no demuestra cohesión perfecta del frontend**. La separación
tarjeta/hook mejora la responsabilidad de peticiones sin inventar clases
para forzar una medición POO que no corresponde al diseño funcional React.

## 10. Complejidad

Inicial: 163 funciones con complejidad estimada ≥ 6 (162 fuera de tests + 1 test).
Final: **166** (164 fuera de tests + 2 tests), máximo **121**.
No cumple y **empeora tres hallazgos**. Se conserva el inventario completo,
incluidos callbacks y funciones JSX; no se ocultaron tests ni se cambiaron regex.

Entre los mayores hallazgos iniciales: `TacticalBoard` 45, `StrategyEditor` 30,
`useGrenadeLibrary` 29, `TeamLineups` 29 y `TacticalCenter` 28. Son estimaciones
con ramas anidadas/JSX; requieren revisión de responsabilidades y estados antes
de nuevas extracciones. La separación FACEIT bajó BigC, no la cantidad global
de funciones complejas. Próxima prioridad: editor táctico y biblioteca de
granadas, con tests de interacción/errores antes de refactorizar.

## 11. Tamaño

Inicial: 234 funciones largas (136 fuera de tests + 98 tests), cero métodos
largos y cero funciones con > 4 parámetros; total 234 / máximo 240.
Final: 237 funciones largas (137 fuera de tests + 100 tests), cero métodos
largos y cero excesos de parámetros; total **237 / máximo 243**.
El semáforo local cumple, pero **sube tres hallazgos y su penalización absoluta**.
Las firmas y líneas no vacías del cuerpo se incluyen. Pasar el umbral
normalizado de tamaño no elimina su peso en el índice.

## 12. Acoplamiento

CBO se define por clases e identificadores externos según la guía. Sin clases,
los dos snapshots dan cero clases con CBO ≥ 8, máximo 48. No equivale a medir
dependencias entre hooks, contextos y módulos ni garantiza bajo acoplamiento
arquitectónico. La tarjeta continúa usando servicios indirectamente a través
del hook; no incorpora HTTP inline, y HTTP_component_files permanece en cero.

## 13. Índice inicial y final, pesos exactos

```text
peso = 20 SEC + 15 SQL + 10 no_layering + 8 (Coh + Acop)
     + 6 BigC + 5 (métodos_largos + Compl)
     + 4 (funciones_largas + parámetros_excesivos)
     + 3 HTTP + 2 Any + 2 DBG + 1,5 duplicación_%
índice = round(4000 / (peso + 40))
```

| Aporte | Inicial | Final |
|---|---:|---:|
| SEC crudo, 1 × 20 | 20 | 20 |
| SQL crudo, 9 × 15 | 135 | 135 |
| BigC × 6 | 66 | 60 |
| Compl × 5 | 815 | 830 |
| Funciones largas × 4 | 936 | 948 |
| DBG × 2 | 22 | 22 |
| Duplicación × 1,5 | 14,1740850642927 | 13,8646430432516 |
| Otras señales | 0 | 0 |
| **Peso crudo** | **2008,1740850642927** | **2028,8646430432516** |
| **Índice crudo** | **2** | **2** |
| **Peso revisado: SEC falso positivo y SQL frontend fuera** | **1853,1740850642927** | **1873,8646430432516** |
| **Índice revisado** | **2** | **2** |

El auditor existente agrega SQL al peso crudo aunque su comentario diga solo
backend; se deja el valor original trazable y se calcula aparte la lectura
aplicable a frontend. No se elimina DBG operacional del índice revisado.
Duplicación < 15 %: **no se aplica tope duro**. El peso empeora a pesar de la
reducción de BigC; no se afirma mejora del índice ni aprobación oficial.

## 14. Archivos modificados en esta sesión

Comparación por hashes entre inventarios, **no** por todo `git diff` (que incluye
mucho trabajo anterior):

| Código relativo a `front/` | Cambio |
|---|---|
| `src/components/faceit/FaceitLinkCard.jsx` | Extrae estado/peticiones |
| `src/components/faceit/useFaceitDiscovery.js` | Hook nuevo |
| `src/components/faceit/FaceitLinkCard.test.jsx` | Suite nueva |
| `src/context/useNotificationHistory.js` | Aislamiento de mutaciones por sesión |
| `src/context/useNotificationHistory.test.js` | Regresiones nuevas |
| `src/services/api.js` | 401 limitado al token vigente |
| `src/services/api.test.js` | Dos regresiones y fixture autenticada corregida |
| `src/components/maps/GrenadeFormFields.jsx` | Import nombrado |
| `src/components/maps/GrenadeFormModal.jsx` | Import nombrado y limpieza |
| `src/components/maps/GrenadeFormModal.test.jsx` | Regresión ensamblada nueva |
| `test/browser/phase-c.mjs` | Verificación reproducible nueva |

Además: `package.json` (comando), `package-lock.json` (reparación compatible),
`vite.config.js` (alcance y umbral), este informe y evidencias `docs/*-session-*.json`.
Los 349 hashes del manifiesto final se verifican contra los archivos actuales.
El contenido de `.env` no se leyó ni se publica en las evidencias.

SHA256 de herramientas/configuración final:

```text
../scripts/audit_react_quality.cjs
1f5bbe5001c2cae0da8da4fdb380aac05a13c3a81425d4b35dc002dd534f4b0e
package.json
e5d244dc6e68238d6759275fa328aac4a35510c0e111fa9a7f34361e36f3466e
package-lock.json
8c8cda4d62e79480410cbbc4478acb9a123466271d21d761036b88b451d11cb7
vite.config.js
9041cff842564c967c61f02a211e7b6268d9f10c8e3746f54e7f4cbf2265b5ee
```

## 15. Regresiones y preservación funcional

- Seis regresiones de sesión fallaron **antes** de su corrección: cuatro de
  notificaciones y dos del interceptor. Después pasaron las 4 suites/29 tests
  de notificaciones/realtime/API/AuthContext.
- El navegador y build fallaron antes de corregir los imports del formulario.
  Después pasaron 3 suites/13 tests relacionados y arrancó la SPA real.
- No se alteraron contratos de API, rutas, autenticación Steam/FACEIT,
  presencia, estructura de permisos o filtros de privacidad del servidor.
- La suite completa conserva tests de perfil, equipos, invitaciones, mapas,
  granadas, propuestas, alineaciones, matchmaking, notificaciones y actividad.
  Pasar tests no es garantía exhaustiva de todos los flujos en producción.
- Navegador: carga real de landing/listado público; redirección sin sesión;
  login/logout **con fixtures**, controles no-admin y edición de equipo
  denegada por respuesta fixture 403 sin formulario de guardado; landing en
  1440/768/390 px sin overflow horizontal, sin excepciones JS.
- Accesibilidad: regresiones existentes de Escape/navegación y consultas por
  roles/labels en los tests nuevos. No se realizó auditoría WCAG completa.

## 16. Problemas pendientes y límites

1. **Índice 2/60, BigC 10/1, Compl 166/121 y DBG 11/0 no cumplen**.
   No es un cierre aprobado del perfil exigente.
2. Nueve suites grandes siguen contándose. Reducirlas requiere una organización
   de pruebas justificada por dominios, no particiones arbitrarias para métricas.
3. SVG cohesivo de 192 líneas sigue siendo el único BigC de producción.
4. Complejidad/tamaño bruto empeoran; revisar siguientes dominios con pruebas
   antes de extraer. No se completó una reestructuración global arriesgada.
5. Build final advierte bundle JS minificado > 500 kB (609,34 kB;
   gzip 176,66 kB). Lazy loading por rutas es una mejora pendiente; no se elevó
   el umbral para ocultar el aviso.
6. Evaluador oficial, sus regex exactas, rama remota `main`, gobernanza y
   reproducción en clon frontend independiente no verificados. Auditor externo
   dependiente de TypeScript del monorepo, explícitamente pendiente.
7. Steam/FACEIT externos **no ejecutados**: sus flujos positivos en unit tests
   usan mocks; no hubo login real Steam/FACEIT ni sincronización externa.
8. Flask real: solo lectura pública/health. Nest real: health/rechazo sin token.
   No se probó un socket real autenticado ni un login real contra PostgreSQL.
   Los permisos positivos/negativos autenticados del navegador usan fixtures.
9. Las rutas `verify:routes` apuntan al despliegue Docker existente, que puede
   contener assets anteriores; el navegador usa el código local actual servido
   por Vite. No se confunden ambas evidencias ni se afirma redeploy.
10. Sin commits, push, repos nuevos, cambios de datos PostgreSQL, rotación de
    secretos, borrado de tests o volúmenes Docker. Ningún archivo fuera de
    `front/` fue modificado por esta ejecución; se preservó trabajo previo.

## 17. Evidencia de pruebas y reproducción

Entorno ejecutado: Windows, Node **24.16.0**, npm **11.13.0**, React **19.2.8**,
Vitest/coverage-v8 **5.0.5**, Vite final **8.3.7**, axios **1.20.0**.

Desde `front/`:

```powershell
npm test -- --maxWorkers=2
npm run test:coverage -- --maxWorkers=2
npm run build
npm run verify:routes
npm audit --omit=dev --json
$env:PLAYWRIGHT_MODULE='C:\Users\rnfac\AppData\Local\Temp\opencode\phase8-browser\node_modules\playwright\index.mjs'
node test/browser/phase-c.mjs
```

Playwright se reutiliza como herramienta de verificación externa y Edge debe
estar instalado. No se agrega dependencia de navegador a producción. El script
levanta Vite transitorio; Flask/Nest deben estar disponibles en loopback 5000/3000
(sobrescribibles con `FLASK_URL`/`NEST_URL`). Fixtures solo en el navegador:
no se crean usuarios ni se escriben datos en servicios reales.

| Comprobación final, después de reparar dependencias | Resultado |
|---|---|
| Vitest completo sin coverage | 88 suites / 473 tests aprobados |
| Vitest completo con coverage | 88 suites / 473 tests; 83,12 % de líneas (umbral 80 % aprobado) |
| Build React | Aprobado, 367 módulos; aviso de chunk grande documentado |
| `verify:routes` | Aprobado, 21 paths SPA, separación API/HTML y health 200 |
| Edge/Playwright con fuente local final | Aprobado; assertions descritas en §15 |
| Flask lectura pública `/api/players` y `/api/health` | 200 reales |
| Nest `/health` mediante proxy y socket sin token | 200 / `AUTH_MISSING_TOKEN` reales |
| Docker inspección solo lectura | Frontend, Flask, NestJS y PostgreSQL running/healthy |
| Auditoría dependencias producción final | 0 vulnerabilidades conocidas |
| Hashes de código | 349/349 coinciden con manifiesto final |

Snapshots intermedios conservados: `quality-c-session-step1.json`,
`quality-c-session-step2.json` y `quality-c-session-step2-final.json`.
Resumen verificable de comandos, entorno, integraciones reales/fixtures y hashes:
`verification-c-session-final.json`. `git diff --check -- front` terminó sin
errores de whitespace (solo advertencias preexistentes de conversión LF/CRLF).
No se modifica el resultado oficial ni se atribuyen verificaciones no ejecutadas.
