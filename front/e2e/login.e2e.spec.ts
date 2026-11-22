import { expect, test } from '@playwright/test';
import { CLIENTE, loginComoCliente } from './helpers';

test.describe('Login', () => {
  test('muestra formulario de login', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
    await expect(page.getByLabel('Usuario')).toBeVisible();
    await expect(page.getByLabel('Contraseña')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible();
  });

  test('con credenciales incorrectas muestra el error y no entra', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Usuario').fill(CLIENTE.usuario);
    await page.getByLabel('Contraseña').fill('contraseña-equivocada');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    await expect(page.getByRole('alert')).toContainText(/Usuario o contraseña/);
    await expect(page).toHaveURL(/\/login$/);
  });

  test('una ruta protegida sin sesión redirige al login', async ({ page }) => {
    await page.goto('/confirmar-compra');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('con credenciales correctas el cliente entra a su portal y puede salir', async ({ page }) => {
    await loginComoCliente(page);
    await expect(page.getByRole('heading', { name: /Hola, cliente/ })).toBeVisible();

    // En móvil "Salir" está dentro del menú desplegable
    const menu = page.getByRole('button', { name: 'Abrir menú' });
    if (await menu.isVisible()) await menu.click();
    await page.getByRole('button', { name: 'Salir' }).click();
    await expect(page).toHaveURL(/\/login$/);
  });
});
