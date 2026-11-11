/**
 * Salida uniforme de las herramientas de verificación del frontend.
 *
 * Estos scripts son CLIs para personas: sus mensajes de progreso y resultado
 * no son depuración de la aplicación. El módulo centraliza el formato y separa
 * los resultados (stdout) de los fallos (stderr) para que todas las
 * verificaciones compartan el mismo canal y conserven sus códigos de salida.
 */
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
