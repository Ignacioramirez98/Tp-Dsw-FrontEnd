/** Importe de un trabajo: horas × precio por hora, redondeado a centavos (igual que el backend). */
export function importeDeHoras(horas: number | null | undefined, importePorHora: number): number {
  const h = Number(horas);
  if (!Number.isFinite(h) || h <= 0) return 0;
  return Math.round(h * importePorHora * 100) / 100;
}

/** Hoy como AAAA-MM-DD en la hora local del navegador (para el mínimo de un campo de fecha). */
export function hoyISO(ahora = new Date()): string {
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${ahora.getFullYear()}-${mes}-${dia}`;
}
