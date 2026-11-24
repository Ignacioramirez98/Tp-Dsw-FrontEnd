import { expect, test } from '@playwright/test';
import { ADMIN, capturar, cerrarSesion, crearVendedorPorApi, iniciarSesion, loginComoAdmin, loginComoOperario } from './helpers';

/**
 * ABM de Usuarios de punta a punta contra el back de prueba, con el administrador:
 * crea una cuenta para una persona, la edita, la desactiva y la vuelve a activar (comprobando en cada
 * paso qué pasa al iniciar sesión), y al eliminar a la persona su cuenta queda desactivada y sin vínculo,
 * así que recién ahí se puede eliminar.
 *
 * Los dos tamaños de pantalla comparten la base del back de prueba: cada corrida usa una persona y un
 * usuario con un sufijo propio y los elimina al final.
 */
test('el admin crea, edita, desactiva y elimina una cuenta de usuario', async ({ page }, testInfo) => {
  const sufijo = `${testInfo.project.name.startsWith('movil') ? 'm' : 'e'}${Date.now().toString().slice(-7)}`;
  const persona = {
    nombre: 'Vera',
    apellido: `Prueba${sufijo}`,
    dni: `4${Date.now().toString().slice(-7)}`,
    mail: `vera.${sufijo}@agrocrm.com`,
    telefono: '3415559999',
  };
  const cuenta = { usuario: `vera_${sufijo}`, contraseña: 'vera-clave-1', contraseñaNueva: 'vera-clave-2' };
  const nombreCompleto = `${persona.nombre} ${persona.apellido}`;
  const fila = () => page.getByRole('row').filter({ hasText: cuenta.usuario });

  // --- Alta: el admin crea la cuenta y la vincula a una persona que todavía no tiene una ---
  await loginComoAdmin(page);
  await crearVendedorPorApi(page, persona);
  await page.goto('/usuarios');
  await expect(page.getByRole('heading', { name: 'Usuarios' })).toBeVisible();
  await expect(page.getByRole('row').filter({ hasText: ADMIN.usuario }).first()).toContainText('(vos)');
  await capturar(page, testInfo, '20-listado-de-usuarios');

  await page.getByRole('link', { name: 'Nuevo usuario' }).click();
  await expect(page).toHaveURL(/\/usuarios\/nuevo$/);
  await page.getByRole('textbox', { name: 'Usuario', exact: true }).fill(cuenta.usuario);
  await page.getByLabel('Contraseña').fill(cuenta.contraseña);
  await page.getByLabel('Rol', { exact: true }).selectOption('vendedor');
  // Solo aparecen las personas del rol que todavía no tienen una cuenta
  await page.getByLabel(/Persona \(/).selectOption({ label: `${persona.apellido}, ${persona.nombre} (DNI ${persona.dni})` });
  await capturar(page, testInfo, '21-nuevo-usuario');
  await page.getByRole('button', { name: 'Crear usuario' }).click();

  await expect(page.getByText('El usuario fue creado.')).toBeVisible();
  await expect(page).toHaveURL(/\/usuarios$/);
  await expect(fila()).toContainText(persona.apellido);
  await expect(fila()).toContainText('Vendedor');
  await expect(fila()).toContainText('Activo');

  // La cuenta nueva ya funciona
  await cerrarSesion(page);
  await iniciarSesion(page, { usuario: cuenta.usuario, contraseña: cuenta.contraseña }, /\/vendedor-dashboard$/);
  await cerrarSesion(page);

  // --- Edición: cambia la contraseña; la anterior deja de servir ---
  await loginComoAdmin(page);
  await page.goto('/usuarios');
  await fila().getByRole('link', { name: `Editar a ${cuenta.usuario}` }).click();
  await expect(page).toHaveURL(/\/usuarios\/edit\/[0-9a-f]{24}$/);
  await page.getByLabel('Contraseña').fill(cuenta.contraseñaNueva);
  await capturar(page, testInfo, '22-editar-usuario');
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.getByText('El usuario fue actualizado.')).toBeVisible();
  await expect(page).toHaveURL(/\/usuarios$/);
  await cerrarSesion(page);

  await page.goto('/login');
  await page.getByLabel('Usuario').fill(cuenta.usuario);
  await page.getByLabel('Contraseña').fill(cuenta.contraseña);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page.locator('.alert-danger')).toContainText(/Usuario o contraseña/);
  await iniciarSesion(page, { usuario: cuenta.usuario, contraseña: cuenta.contraseñaNueva }, /\/vendedor-dashboard$/);
  await cerrarSesion(page);

  // --- Desactivar: pide confirmación y la cuenta ya no puede entrar ---
  await loginComoAdmin(page);
  await page.goto('/usuarios');
  await fila().getByRole('button', { name: `Desactivar a ${cuenta.usuario}` }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Desactivar', exact: true }).click();
  await expect(page.getByText(`Se desactivó el usuario ${cuenta.usuario}.`)).toBeVisible();
  await expect(fila()).toContainText('Desactivado');
  await capturar(page, testInfo, '23-usuario-desactivado');
  await cerrarSesion(page);

  await page.goto('/login');
  await page.getByLabel('Usuario').fill(cuenta.usuario);
  await page.getByLabel('Contraseña').fill(cuenta.contraseñaNueva);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page.locator('.alert-danger')).toContainText('desactivado');
  await expect(page).toHaveURL(/\/login$/);

  // --- Activar de nuevo: sin confirmación; una cuenta vinculada a una persona no se puede eliminar ---
  await loginComoAdmin(page);
  await page.goto('/usuarios');
  await fila().getByRole('button', { name: `Activar a ${cuenta.usuario}` }).click();
  await expect(page.getByText(`Se activó el usuario ${cuenta.usuario}.`)).toBeVisible();
  await expect(fila()).toContainText('Activo');
  await expect(fila().getByRole('button', { name: `Eliminar a ${cuenta.usuario}` })).toBeDisabled();

  // --- Baja de la persona: su cuenta queda desactivada y sin vínculo, y ahora sí se puede eliminar ---
  await page.goto('/vendedores');
  await page.getByLabel('Buscar').fill(persona.apellido);
  await page.getByRole('button', { name: `Eliminar a ${nombreCompleto}` }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Eliminar', exact: true }).click();
  await expect(page.getByText(`Se eliminó a ${nombreCompleto}.`)).toBeVisible();

  await page.goto('/usuarios');
  await expect(fila()).toContainText('Desactivado');
  await expect(fila()).not.toContainText(persona.apellido);
  await capturar(page, testInfo, '24-cuenta-sin-persona');
  await fila().getByRole('button', { name: `Eliminar a ${cuenta.usuario}` }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Eliminar', exact: true }).click();
  await expect(page.getByText(`Se eliminó el usuario ${cuenta.usuario}.`)).toBeVisible();
  await expect(fila()).toHaveCount(0);
});

test('solo el admin ve y puede abrir Usuarios', async ({ page }) => {
  await loginComoOperario(page);
  await expect(page.getByRole('link', { name: 'Usuarios', exact: true })).toHaveCount(0);
  // Para otro rol la ruta no existe: lo manda a su pantalla de inicio
  await page.goto('/usuarios');
  await expect(page).toHaveURL(/\/vendedor-dashboard$/);
});
