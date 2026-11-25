import { expect, test } from '@playwright/test';
import { API, capturar, cerrarSesion, crearVendedorPorApi, importe, loginComoAdmin, loginComoCliente, RASTRA, tarjeta } from './helpers';

/**
 * CUU Realizar facturación de punta a punta contra el back de prueba:
 * el cliente pide una rastra → el admin concreta la venta y la factura → ve el comprobante con IVA discriminado →
 * la factura no se puede emitir dos veces → el cliente ve su factura (y no puede operar sobre la venta).
 *
 * Los dos tamaños de pantalla comparten la base del back de prueba: cada corrida usa su propio pedido
 * y su propio vendedor, así que no dependen de lo que dejó la otra.
 */
test('se concreta y se factura una venta, el comprobante discrimina el IVA y el cliente ve su factura', async ({ page }, testInfo) => {
  const neto = RASTRA.precio; // una rastra
  const iva = Math.round(neto * 0.21);
  const total = neto + iva;
  const sufijo = `${testInfo.project.name}-${Date.now()}`;

  // --- Cliente: pide una rastra ---
  await loginComoCliente(page);
  await page.getByRole('link', { name: /Catálogo/ }).first().click();
  await expect(page).toHaveURL(/\/seleccion-productos$/);
  await tarjeta(page, RASTRA.nombre).getByRole('button', { name: 'Agregar' }).click();
  await page.getByRole('link', { name: /^(Revisar y enviar|Ver pedido)$/ }).click();
  await expect(page).toHaveURL(/\/confirmar-compra$/);
  await page.getByRole('button', { name: 'Enviar pedido' }).click();
  await expect(page).toHaveURL(/\/ventas\/[0-9a-f]{24}$/);
  const rutaVenta = new URL(page.url()).pathname;
  await cerrarSesion(page);

  // --- Admin: concreta la venta (elige un vendedor) ---
  await loginComoAdmin(page);
  const vendedor = { nombre: 'Facundo', apellido: `Factura ${sufijo}`, dni: String(Date.now()).slice(-8), mail: `facturador.${Date.now()}@agrocrm.com`, telefono: '3415550000' };
  await crearVendedorPorApi(page, vendedor);
  await page.goto(rutaVenta);
  await expect(page.locator('app-status-chip').getByText('Pendiente', { exact: true })).toBeVisible();
  // Todavía no se puede facturar: primero hay que concretar
  await expect(page.getByRole('button', { name: 'Facturar venta' })).toHaveCount(0);

  await page.getByRole('button', { name: 'Concretar venta' }).click();
  const dialogo = page.getByRole('dialog');
  await dialogo.getByLabel('Vendedor').selectOption({ label: `${vendedor.nombre} ${vendedor.apellido}` });
  await dialogo.getByLabel('Avisar al cliente por mail').uncheck();
  await dialogo.getByRole('button', { name: 'Concretar venta' }).click();
  await expect(page.getByText('La venta fue concretada y se descontó el stock.')).toBeVisible();
  await expect(page.locator('app-status-chip').getByText('Concretada', { exact: true })).toBeVisible();
  await capturar(page, testInfo, '25-venta-concretada');

  // --- Admin: factura la venta concretada ---
  await page.getByRole('button', { name: 'Facturar venta' }).click();
  const confirmacion = page.getByRole('dialog');
  await expect(confirmacion.getByText(/IVA discriminado/)).toBeVisible();
  await capturar(page, testInfo, '26-confirmar-facturacion');
  await confirmacion.getByRole('button', { name: 'Facturar', exact: true }).click();

  const aviso = page.getByText(/Se emitió la factura 0001-\d{8}/);
  await expect(aviso).toBeVisible();
  const numero = (await aviso.textContent())!.match(/0001-\d{8}/)![0];
  await expect(page.locator('app-status-chip').getByText('Facturada', { exact: true })).toBeVisible();
  // Facturada: ya no se factura ni se cancela, y aparece el acceso al comprobante
  await expect(page.getByRole('button', { name: 'Facturar venta' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Cancelar venta' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Ver factura' })).toBeVisible();
  await capturar(page, testInfo, '27-venta-facturada');

  // --- Comprobante: renglón neto, IVA 21% discriminado y total ---
  await page.getByRole('link', { name: 'Ver factura' }).click();
  await expect(page).toHaveURL(/\/facturas\/[0-9a-f]{24}$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(numero);
  const comprobante = page.getByRole('article', { name: `Factura ${numero}` });
  await expect(comprobante).toContainText('Juan Pérez');
  await expect(comprobante.getByRole('row').filter({ hasText: RASTRA.nombre })).toContainText(importe(neto));
  const totales = page.locator('dl[aria-label="Totales"]');
  await expect(totales.getByText('IVA 21%')).toBeVisible();
  await expect(totales).toContainText(importe(neto));
  await expect(totales).toContainText(importe(iva));
  await expect(totales).toContainText(importe(total));
  await expect(page.getByRole('button', { name: /Imprimir/ })).toBeVisible();
  await capturar(page, testInfo, '28-factura');

  // --- La factura es inmutable: no se puede emitir otra para la misma venta ---
  const token = await page.evaluate(() => localStorage.getItem('token'));
  const idVenta = rutaVenta.split('/').pop();
  const repetida = await page.request.post(`${API}/ventas/${idVenta}/facturar`, { headers: { Authorization: `Bearer ${token}` } });
  expect(repetida.status()).toBe(409);

  // --- Listado del personal ---
  await page.goto('/facturas');
  await expect(page.getByRole('heading', { name: 'Facturas', exact: true })).toBeVisible();
  const fila = page.getByRole('row').filter({ hasText: numero });
  await expect(fila).toContainText('Juan Pérez');
  await expect(fila).toContainText(importe(total));
  await capturar(page, testInfo, '29-facturas-del-personal');
  await cerrarSesion(page);

  // --- Cliente: ve su factura, pero no opera sobre la venta ---
  await loginComoCliente(page);
  await page.goto('/facturas');
  await expect(page.getByRole('heading', { name: 'Mis facturas' })).toBeVisible();
  await expect(page.getByRole('row').filter({ hasText: numero })).toContainText(importe(total));
  await capturar(page, testInfo, '30-mis-facturas');
  await page.getByRole('row').filter({ hasText: numero }).getByRole('link', { name: /Ver la factura/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(numero);
  await expect(page.getByText('IVA 21%')).toBeVisible();
  await capturar(page, testInfo, '31-factura-del-cliente');

  await page.goto(rutaVenta);
  await expect(page.locator('app-status-chip').getByText('Facturada', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ver factura' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Facturar venta|Cancelar pedido|Cancelar venta/ })).toHaveCount(0);
});
