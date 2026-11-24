import { hoyISO, importeDeHoras } from './solicitud';

describe('solicitud utils', () => {
  it('calcula el importe como horas por precio, redondeado a centavos', () => {
    expect(importeDeHoras(3, 1000)).toBe(3000);
    expect(importeDeHoras(1.5, 35000)).toBe(52500);
    expect(importeDeHoras(0.333, 100)).toBe(33.3);
  });

  it('da 0 si las horas no son válidas', () => {
    expect(importeDeHoras(null, 1000)).toBe(0);
    expect(importeDeHoras(0, 1000)).toBe(0);
    expect(importeDeHoras(-2, 1000)).toBe(0);
    expect(importeDeHoras(NaN, 1000)).toBe(0);
  });

  it('formatea hoy como AAAA-MM-DD con ceros', () => {
    expect(hoyISO(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(hoyISO(new Date(2026, 10, 24))).toBe('2026-11-24');
  });
});
