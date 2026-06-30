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

## E2E (primera ejecución)

Instalar navegadores de Playwright una sola vez:

```bash
npx playwright install
```

Luego correr:

```bash
npm run test:e2e
```

## Configuración de ambientes

- `src/environments/environment.ts`
- `src/environments/environment.development.ts`
