// Corre el e2e guardando capturas de cada paso en ../docs/evidencia-e2e (funciona igual en Windows, Mac y Linux).
import { spawnSync } from 'node:child_process';

const resultado = spawnSync('npx', ['playwright', 'test', ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, E2E_EVIDENCIA: '1' },
});
process.exit(resultado.status ?? 1);
