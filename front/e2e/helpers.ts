import { expect, Page, TestInfo } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

/** Cliente de prueba que crea `npm run e2e:server` en el back. */
export const CLIENTE = { usuario: 'cliente', contraseña: 'cliente123' };

/** Operario de prueba: responsable del servicio SERVICIO (lo crea `npm run e2e:server` en el back). */
export const OPERARIO = { usuario: 'operario', contraseña: 'operario123' };

/** Administrador de prueba (lo crea `npm run e2e:server` en el back; los admins no se crean por la API). */
export const ADMIN = { usuario: 'admin', contraseña: 'admin123' };

/** URL del back de prueba (el mismo puerto que usa el front en environment.development.ts). */
export const API = 'http://localhost:3000';

/** Servicio de prueba que carga el back: Service general de tractor, $35.000 por hora, a cargo de OPERARIO. */
export const SERVICIO = { descripcion: 'Service general de tractor', precioHora: 35_000, operario: 'Carlos Benítez' };

/** Productos de prueba (mismos datos que carga el back). */
export const TRACTOR = { nombre: 'Tractor 120 HP', precio: 45_000_000 };
export const RASTRA = { nombre: 'Rastra de discos 28', precio: 7_900_000 };

/** Arma una expresión para un importe en pesos ("$ 60.800.000" o "$60.800.000", con espacio común o no cortante). */
export function importe(valor: number): RegExp {
  const miles = valor.toLocaleString('de-DE'); // 60800000 -> "60.800.000"
  return new RegExp(`\\$\\s*${miles.replace(/\./g, '\\.')}`);
}

export async function loginComoCliente(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Usuario').fill(CLIENTE.usuario);
  await page.getByLabel('Contraseña').fill(CLIENTE.contraseña);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(/\/cliente-dashboard$/);
}

/** Inicia sesión con un usuario de prueba y espera llegar a la pantalla de inicio de su rol. */
export async function iniciarSesion(page: Page, credenciales: { usuario: string; contraseña: string }, inicio: RegExp) {
  await page.goto('/login');
  await page.getByLabel('Usuario').fill(credenciales.usuario);
  await page.getByLabel('Contraseña').fill(credenciales.contraseña);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(inicio);
}

export const loginComoOperario = (page: Page) => iniciarSesion(page, OPERARIO, /\/vendedor-dashboard$/);

export const loginComoAdmin = (page: Page) => iniciarSesion(page, ADMIN, /\/vendedor-dashboard$/);

/**
 * Da de alta un vendedor directo en la API, con la sesión del admin que ya inició sesión en `page`.
 * Sirve para tener una persona sin cuenta a la que vincular un usuario nuevo.
 */
export async function crearVendedorPorApi(page: Page, datos: { nombre: string; apellido: string; dni: string; mail: string; telefono: string }) {
  const token = await page.evaluate(() => localStorage.getItem('token'));
  const respuesta = await page.request.post(`${API}/vendedores`, { headers: { Authorization: `Bearer ${token}` }, data: datos });
  expect(respuesta.ok(), `No se pudo crear el vendedor de prueba (${respuesta.status()})`).toBeTruthy();
}

/** Cierra la sesión. En móvil el botón está dentro del menú desplegable. */
export async function cerrarSesion(page: Page) {
  const menu = page.getByRole('button', { name: 'Abrir menú' });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole('button', { name: /^(Salir|Cerrar sesión)$/ }).click();
  await expect(page).toHaveURL(/\/login$/);
}

/** Tarjeta de un producto en el catálogo. */
export function tarjeta(page: Page, nombre: string) {
  return page.getByRole('article').filter({ has: page.getByRole('heading', { name: nombre }) });
}

/**
 * Guarda una captura como evidencia en `../docs/evidencia-e2e/<proyecto>/` (relativo a front/).
 * Solo si E2E_EVIDENCIA=1, para que una corrida normal no ensucie el repositorio.
 */
export async function capturar(page: Page, testInfo: TestInfo, nombre: string) {
  if (!process.env.E2E_EVIDENCIA) return;
  const carpeta = join(process.cwd(), '..', 'docs', 'evidencia-e2e', testInfo.project.name);
  mkdirSync(carpeta, { recursive: true });
  await page.screenshot({ path: join(carpeta, `${nombre}.png`) });
}
