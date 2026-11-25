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

Prueba cuatro flujos reales:

- **Compra** (cliente): login → catálogo → agregar productos → "Tu pedido" → enviar → detalle del pedido pendiente.
- **Solicitar Servicio** (cliente y operario): el cliente pide un servicio → el operario lo acepta y lo finaliza con las horas reales → el cliente ve su solicitud finalizada con el importe final.
- **ABM de Usuarios** (admin): crea la cuenta de una persona, la edita (contraseña), la desactiva y la reactiva, comprobando en cada paso qué pasa al iniciar sesión; al eliminar a la persona su cuenta queda desactivada y sin vínculo, y recién ahí se puede eliminar. Además comprueba que un operario no ve ni abre *Usuarios*.
- **Facturación** (cliente y admin): el cliente pide una rastra → el admin concreta la venta (eligiendo vendedor) y la factura → el comprobante muestra el neto, el IVA 21% y el total → una segunda facturación de la misma venta es rechazada (409) → el cliente ve la factura en *Mis facturas* y no puede facturar ni cancelar.

Los cuatro corren en dos tamaños de pantalla (móvil 390 px y escritorio 1280 px). Usa el front real y el back real con una **base MongoDB efímera** (nunca toca Atlas ni el `.env`).

Usuarios de prueba que carga el back (`npm run e2e:server`): `admin / admin123`, `cliente / cliente123` y `operario / operario123`.

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

## Solicitar Servicio

Caso de uso en el que el cliente pide un servicio técnico y un operario lo realiza:

1. **Cliente**: en *Servicios* toca **Solicitar**, indica las horas estimadas, una fecha preferida y observaciones (opcionales). Ve el importe estimado (horas × precio por hora). La solicitud queda `pendiente`.
2. **Operario**: la ve en su panel y en *Solicitudes*. La **acepta** (queda a su nombre) y, al terminar el trabajo, la **finaliza** con las horas reales; el importe final se calcula con ellas.
3. **Cancelación**: el cliente cancela solo sus solicitudes pendientes; el operario (o el admin) también las aceptadas, con un motivo opcional que el cliente ve.

Cada rol ve solo lo suyo: el cliente, sus solicitudes; el operario, las de sus servicios y las que no tienen responsable; el admin, todas. El admin puede elegir el operario al aceptar una solicitud sin responsable. Los estados y permisos los define el backend (ver su README, sección "Solicitudes de servicio").

Pantallas: `/servicios` (tarjetas con **Solicitar**), `/solicitudes-servicio` (*Mis solicitudes* para el cliente, *Solicitudes de servicio* para el personal) y `/solicitudes-servicio/:id` (detalle y acciones).

## Facturación

Caso de uso que toma como entrada una venta ya **concretada**:

1. **Vendedor o admin**: en el detalle de una venta concretada toca **Facturar venta** y confirma. Se emite la factura con numeración correlativa (`0001-00000001`) y la venta pasa a `facturada`.
2. **Comprobante**: muestra los datos del cliente tal como estaban al emitir, un renglón por producto, subtotal, **IVA 21% discriminado** y total. Los precios de los productos se toman como netos de IVA. Se puede imprimir o guardar como PDF con **Imprimir / guardar PDF**.
3. **Reglas**: la factura no se modifica ni se anula, y una venta facturada ya no se puede cancelar. Los servicios no se facturan (se cotizan por hora): una venta con solo servicios no se puede facturar.

Cada rol ve lo suyo: el personal, todas las facturas; el cliente, solo las de sus compras (*Mis facturas*), y no puede emitirlas. Las reglas las define el backend (ver su README, sección "Facturas").

Pantallas: `/facturas` (listado con búsqueda y filtro por fecha), `/facturas/:id` (comprobante) y el botón **Facturar venta** / **Ver factura** en `/ventas/:id`.

## ABM de Usuarios

Pantalla solo para el rol **admin**, en `/usuarios` (menú *Usuarios*):

- **Listado**: usuario, rol, persona vinculada (cliente, vendedor u operario) y estado, con paginado.
- **Nuevo usuario**: usuario, contraseña (mínimo 6), rol y la persona que todavía no tiene cuenta. Los admins no se crean desde la pantalla.
- **Editar**: cambia usuario, contraseña (opcional), rol y persona. El admin no puede cambiar su propio rol.
- **Desactivar / Activar**: un usuario desactivado no puede iniciar sesión. Un admin no puede desactivarse ni eliminarse a sí mismo.
- **Eliminar**: solo las cuentas sin persona vinculada. Si tiene una, hay que desactivarla; al eliminar a la persona su cuenta se desactiva y se desvincula sola.

Un token ya emitido sigue valiendo hasta que vence aunque se desactive la cuenta: lo que se bloquea es el inicio de sesión. Las reglas las define el backend (ver su README, sección "Usuarios").

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

### Deploy en Vercel

Producción: front en `https://pauny-crm.vercel.app` y back en `https://pauny-crm-api.vercel.app`.

En Vercel: importar el repo y poner **Root Directory** = `front`. El resto lo define `front/vercel.json`:
- build con `npm run build:prod` (verifica que `apiUrl` no apunte a localhost);
- salida en `dist/front/browser`;
- todas las rutas devuelven `index.html`, así recargar `/ventas/123` no da 404 (Angular resuelve la ruta en el navegador).

No necesita variables de entorno. Cada push a `main` publica una versión nueva.
