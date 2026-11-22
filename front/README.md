# Front

Proyecto Angular 18 del frontend.

## Requisitos previos

- Node.js LTS (recomendado 20.x)
- npm

## Instalación

```bash
npm install
```

## Ejecutar en desarrollo

Con el backend levantado en `http://localhost:3000`:

```bash
npm run start
```

Abrir: `http://localhost:4200`

## Scripts

- `npm run start`: servidor de desarrollo.
- `npm run build`: build de producción.
- `npm run watch`: build en modo watch.
- `npm run test`: tests unitarios.
- `npm run test:e2e`: tests end-to-end (Playwright).
- `npm run test:e2e:evidencia`: igual que el anterior, pero guarda capturas de cada paso en `../docs/evidencia-e2e/`.

## E2E (Playwright)

Prueba el flujo real del cliente: **login → catálogo → agregar productos → "Tu pedido" → enviar → detalle del pedido pendiente**, en dos tamaños de pantalla (móvil 390 px y escritorio 1280 px). Usa el front real y el back real con una **base MongoDB efímera** (nunca toca Atlas ni el `.env`).

Requisitos: el repo del back (`Tp-Dsw-BackEnd`) con `npm install` hecho, como carpeta hermana de este repo. Si está en otro lugar, definir `E2E_BACK_DIR` con su ruta.

Instalar el navegador de Playwright una sola vez:

```bash
npx playwright install chromium
```

Correr (levanta solo el back de prueba en el puerto 3000 y el front en el 4200):

```bash
npm run test:e2e
npx playwright show-report   # reporte HTML
```

- El puerto 3000 tiene que estar libre: si tenés el back de desarrollo corriendo, cortalo antes (si no, el test falla en vez de usar tu base real).
- La primera vez `mongodb-memory-server` descarga MongoDB y puede tardar unos minutos.
- Para dejar capturas de evidencia: `npm run test:e2e:evidencia`.

## Configuración de ambientes

- `src/environments/environment.ts`
- `src/environments/environment.development.ts`
