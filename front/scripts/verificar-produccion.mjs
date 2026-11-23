// Verifica que el ambiente de producción esté bien configurado antes de desplegar.
// Uso: npm run verificar:prod   (también corre dentro de `npm run build:prod`)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const archivo = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'environments', 'environment.ts');
const texto = readFileSync(archivo, 'utf8');

const apiUrl = /apiUrl:\s*['"`]([^'"`]*)['"`]/.exec(texto)?.[1];
const produccion = /production:\s*(true|false)/.exec(texto)?.[1];
const errores = [];

if (produccion !== 'true') errores.push('environment.ts debe tener production: true.');
if (!apiUrl) {
  errores.push('No se encontró apiUrl en environment.ts.');
} else {
  if (!/^https:\/\//.test(apiUrl)) errores.push(`apiUrl tiene que empezar con https:// (hoy: ${apiUrl}).`);
  if (/localhost|127\.0\.0\.1|0\.0\.0\.0/.test(apiUrl)) errores.push(`apiUrl apunta a la máquina local (${apiUrl}): poné la URL del back desplegado.`);
  if (/\/$/.test(apiUrl)) errores.push('apiUrl no debe terminar en "/" (las rutas se arman como `${apiUrl}/productos`).');
  if (/\s/.test(apiUrl)) errores.push('apiUrl no debe tener espacios.');
}

if (errores.length) {
  console.error('\n[verificar:prod] El ambiente de producción no está listo:');
  errores.forEach((e) => console.error('  - ' + e));
  console.error('\nEditá src/environments/environment.ts y volvé a correr el comando.\n');
  process.exit(1);
}
console.log(`[verificar:prod] OK: producción apunta a ${apiUrl}`);
