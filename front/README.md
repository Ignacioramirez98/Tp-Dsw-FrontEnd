# Front

Proyecto Angular 20 del frontend.

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
- `npm run build:prod`: igual, pero antes verifica que `apiUrl` de producción sea la URL https del back desplegado (falla si apunta a localhost).
- `npm run verificar:prod`: solo la verificación anterior.
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

Hay dos ambientes. La URL del back se lee siempre de `environment.apiUrl` (también para las imágenes, con `urlImagen()`); no hay URLs escritas a mano en el código.

| Ambiente | Archivo | Se usa con | `apiUrl` |
|---|---|---|---|
| Desarrollo | `src/environments/environment.development.ts` | `npm start` | `http://localhost:3000` (el back de cada PC) |
| Producción | `src/environments/environment.ts` | `npm run build` / `npm run build:prod` | URL https del back desplegado en Vercel |

Cómo funciona: `ng build` usa por defecto la configuración `production`, que toma `environment.ts` tal cual. La configuración `development` de `angular.json` lo reemplaza por `environment.development.ts`.

Para apuntar a otro back de producción hay que cambiar `apiUrl` en `environment.ts`:
- con `https://` y **sin barra final** (por ejemplo `https://pauny-crm-api.vercel.app`);
- sin secretos: ese archivo termina dentro del JavaScript que descarga el navegador.

Del lado del back, la variable `FRONTEND_URL` tiene que ser exactamente la URL del front desplegado; si no, el navegador bloquea las peticiones por CORS (ver el README del back).
