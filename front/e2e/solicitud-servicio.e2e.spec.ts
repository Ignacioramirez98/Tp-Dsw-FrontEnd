import { expect, test } from '@playwright/test';
import { capturar, cerrarSesion, importe, loginComoCliente, loginComoOperario, SERVICIO } from './helpers';

/**
 * CUU Solicitar Servicio de punta a punta contra el back de prueba:
 * el cliente pide un servicio → el operario lo acepta y lo finaliza con las horas reales →
 * el cliente ve su solicitud finalizada con el importe final.
 *
 * Los dos tamaños de pantalla comparten la base del back de prueba: cada corrida marca su solicitud
 * con un texto propio y la deja finalizada, así la siguiente solo encuentra la suya pendiente.
 */
test('el cliente pide un servicio, el operario lo acepta y finaliza, y el cliente ve el importe final', async ({ page }, testInfo) => {
  const nota = `E2E ${testInfo.project.name} ${Date.now()}`;
  const estimado = 3 * SERVICIO.precioHora; // 3 horas estimadas
  const final = 4 * SERVICIO.precioHora; // 4 horas reales

  // --- Cliente: elige el servicio y lo solicita ---
  await loginComoCliente(page);
  await page.getByRole('main').getByRole('link', { name: /Servicios/ }).click();
  await expect(page).toHaveURL(/\/servicios$/);
  const tarjeta = page.getByRole('article').filter({ has: page.getByRole('heading', { name: SERVICIO.descripcion }) });
  await expect(tarjeta).toBeVisible();
  await capturar(page, testInfo, '10-servicios-del-cliente');
  await tarjeta.getByRole('link', { name: 'Solicitar' }).click();

  await expect(page).toHaveURL(/\/solicitudes-servicio\/nueva\/[0-9a-f]{24}$/);
  await page.getByLabel('Horas estimadas').fill('3');
  await page.getByLabel(/Observaciones/).fill(nota);
  await expect(page.getByRole('complementary').getByText(importe(estimado))).toBeVisible();
  await capturar(page, testInfo, '11-pedir-servicio');
  await page.getByRole('button', { name: 'Enviar solicitud' }).click();

  // Detalle: pendiente, con el operario del servicio y el importe estimado
  await expect(page).toHaveURL(/\/solicitudes-servicio\/[0-9a-f]{24}$/);
  await expect(page.getByText(/Enviamos tu solicitud/)).toBeVisible();
  await expect(page.getByRole('heading', { name: SERVICIO.descripcion })).toBeVisible();
  await expect(page.locator('app-status-chip').getByText('Pendiente', { exact: true })).toBeVisible();
  await expect(page.getByText(SERVICIO.operario)).toBeVisible();
  await expect(page.getByText(importe(estimado)).first()).toBeVisible();
  await expect(page.getByText(nota)).toBeVisible();
  await capturar(page, testInfo, '12-solicitud-enviada');
  await cerrarSesion(page);

  // --- Operario: la ve en su panel, la acepta y la finaliza ---
  await loginComoOperario(page);
  await expect(page.getByText('Solicitudes de servicio pendientes')).toBeVisible();
  await capturar(page, testInfo, '13-panel-del-operario');
  await page.goto('/solicitudes-servicio');
  await expect(page.getByRole('heading', { name: 'Solicitudes de servicio' })).toBeVisible();
  await capturar(page, testInfo, '14-solicitudes-del-operario');
  await page.getByRole('row').filter({ hasText: 'Pendiente' }).getByRole('link', { name: /Ver la solicitud/ }).first().click();

  // El listado va de la más nueva a la más vieja: la primera pendiente es la que acaba de pedir el cliente
  await expect(page.getByRole('heading', { name: SERVICIO.descripcion })).toBeVisible();
  await expect(page.getByText(nota)).toBeVisible();

  await page.getByRole('button', { name: 'Aceptar solicitud' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Aceptar solicitud' }).click();
  await expect(page.getByText('La solicitud fue aceptada.')).toBeVisible();
  await expect(page.locator('app-status-chip').getByText('Aceptada', { exact: true })).toBeVisible();
  await capturar(page, testInfo, '15-solicitud-aceptada');

  await page.getByRole('button', { name: 'Finalizar trabajo' }).click();
  const dialogo = page.getByRole('dialog');
  await dialogo.getByLabel('Horas reales trabajadas').fill('4');
  await expect(dialogo.getByText(importe(final))).toBeVisible();
  await capturar(page, testInfo, '16-finalizar-trabajo');
  await dialogo.getByRole('button', { name: 'Finalizar trabajo' }).click();
  await expect(page.getByText('Trabajo finalizado.')).toBeVisible();
  await expect(page.locator('app-status-chip').getByText('Finalizada', { exact: true })).toBeVisible();
  await expect(page.getByText(importe(final)).first()).toBeVisible();
  await cerrarSesion(page);

  // --- Cliente: ve su solicitud finalizada con el importe final ---
  await loginComoCliente(page);
  await page.goto('/solicitudes-servicio');
  await expect(page.getByRole('heading', { name: 'Mis solicitudes' })).toBeVisible();
  await page.getByRole('row').filter({ hasText: 'Finalizada' }).getByRole('link', { name: /Ver la solicitud/ }).first().click();
  await expect(page.locator('app-status-chip').getByText('Finalizada', { exact: true })).toBeVisible();
  await expect(page.getByText('Importe final')).toBeVisible();
  await expect(page.getByText(importe(final)).first()).toBeVisible();
  await capturar(page, testInfo, '17-solicitud-finalizada');
});
