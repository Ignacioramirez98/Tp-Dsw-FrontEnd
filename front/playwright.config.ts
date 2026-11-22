import { defineConfig } from '@playwright/test';

/**
 * E2E con Playwright: front real (ng serve) + back real con una base MongoDB efímera.
 *
 * El back se levanta con `npm run e2e:server` del repo Tp-Dsw-BackEnd (carpeta hermana por defecto;
 * se puede cambiar con la variable E2E_BACK_DIR). Ese servidor usa mongodb-memory-server, así que
 * nunca toca la base real ni lee el .env. La primera vez descarga MongoDB (puede tardar unos minutos).
 *
 * Variables opcionales:
 *   E2E_BACK_DIR       carpeta del repo del back (por defecto ../../Tp-Dsw-BackEnd)
 *   E2E_REUSAR_BACK=1  no levantar el back: usar el que ya está en el puerto 3000 (¡que sea uno de prueba!)
 *   E2E_EVIDENCIA=1    guardar capturas de cada paso en ../docs/evidencia-e2e (ver `npm run test:e2e:evidencia`)
 */
const carpetaBack = process.env.E2E_BACK_DIR ?? '../../Tp-Dsw-BackEnd';

export default defineConfig({
  testDir: './e2e',
  // El back de prueba es uno solo y los tests comparten su base: se corre de a uno
  workers: 1,
  fullyParallel: false,
  retries: 0,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4200',
    locale: 'es-AR',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'movil-390', use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, hasTouch: true } },
    { name: 'escritorio-1280', use: { browserName: 'chromium', viewport: { width: 1280, height: 800 } } },
  ],
  webServer: [
    {
      command: 'npm run e2e:server',
      cwd: carpetaBack,
      port: 3000,
      // Nunca se reutiliza por defecto: si el puerto 3000 está ocupado por el back de desarrollo
      // (con la base real), falla en vez de correr los tests contra datos reales.
      reuseExistingServer: !!process.env.E2E_REUSAR_BACK,
      timeout: 300_000,
      stdout: 'pipe',
    },
    {
      command: 'npm run start',
      url: 'http://localhost:4200',
      reuseExistingServer: true,
      timeout: 180_000,
    },
  ],
});
