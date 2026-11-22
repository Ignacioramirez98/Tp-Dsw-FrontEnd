import { expect, test } from '@playwright/test';
import { capturar, importe, loginComoCliente, RASTRA, tarjeta, TRACTOR } from './helpers';

/**
 * Flujo real del cliente, de punta a punta contra el back de prueba:
 * login → catálogo → agregar productos → "Tu pedido" → enviar → detalle del pedido pendiente.
 */
test('el cliente inicia sesión, arma un pedido, lo envía y lo ve pendiente', async ({ page }, testInfo) => {
  await loginComoCliente(page);
  await capturar(page, testInfo, '01-portal-del-cliente');

  // Catálogo
  await page.getByRole('link', { name: /Catálogo/ }).first().click();
  await expect(page).toHaveURL(/\/seleccion-productos$/);
  await expect(tarjeta(page, TRACTOR.nombre)).toBeVisible();
  await expect(tarjeta(page, RASTRA.nombre)).toBeVisible();
  await capturar(page, testInfo, '02-catalogo');

  // Un tractor y dos rastras (la segunda con el stepper)
  await tarjeta(page, TRACTOR.nombre).getByRole('button', { name: 'Agregar' }).click();
  await tarjeta(page, RASTRA.nombre).getByRole('button', { name: 'Agregar' }).click();
  await page.getByRole('button', { name: `Agregar uno de ${RASTRA.nombre}` }).click();
  await expect(tarjeta(page, RASTRA.nombre).getByRole('status')).toHaveText('2');
  await capturar(page, testInfo, '03-productos-agregados');

  // El carrito sobrevive a una recarga (queda guardado en el navegador)
  await page.reload();
  await expect(tarjeta(page, RASTRA.nombre).getByRole('status')).toHaveText('2');

  // "Revisar y enviar" en escritorio, "Ver pedido" en móvil: solo uno está visible a la vez
  await page.getByRole('link', { name: /^(Revisar y enviar|Ver pedido)$/ }).click();
  await expect(page).toHaveURL(/\/confirmar-compra$/);
  await expect(page.getByRole('heading', { name: 'Tu pedido' })).toBeVisible();

  const total = TRACTOR.precio + 2 * RASTRA.precio;
  const resumen = page.getByRole('complementary');
  await expect(resumen.getByText(importe(total))).toBeVisible();
  await expect(resumen).toContainText('Juan Pérez'); // datos del cliente que trae el back
  await capturar(page, testInfo, '04-tu-pedido');

  // Envío
  await page.getByRole('button', { name: 'Enviar pedido' }).click();
  await expect(page).toHaveURL(/\/ventas\/[0-9a-f]{24}$/);
  await expect(page.getByText(/Enviamos tu pedido/)).toBeVisible();

  // Detalle: pendiente, con los ítems y el total correctos, sin vendedor asignado
  await expect(page.getByRole('heading', { name: /^Pedido del / })).toBeVisible();
  await expect(page.getByText('Pendiente', { exact: true })).toBeVisible();
  const filaTractor = page.getByRole('row').filter({ hasText: TRACTOR.nombre });
  const filaRastra = page.getByRole('row').filter({ hasText: RASTRA.nombre });
  await expect(filaTractor).toContainText(importe(TRACTOR.precio));
  await expect(filaRastra).toContainText(importe(2 * RASTRA.precio));
  await expect(page.getByText(importe(total)).first()).toBeVisible();
  await expect(page.getByText(/Sin asignar/)).toBeVisible();
  await capturar(page, testInfo, '05-pedido-enviado');

  // El carrito quedó vacío y el pedido figura en "Mis compras"
  await page.getByRole('link', { name: 'Mis compras' }).first().click();
  await expect(page).toHaveURL(/\/ventas$/);
  await expect(page.getByText('Pendiente', { exact: true }).first()).toBeVisible();
  await capturar(page, testInfo, '06-mis-compras');
});
