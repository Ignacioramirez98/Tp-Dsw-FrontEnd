import { FormControl } from '@angular/forms';
import { Validadores, mensajeDeError } from './validadores';

describe('Validadores (mismas reglas que el backend)', () => {
  const valida = (validador: (c: FormControl) => unknown, valor: string) => validador(new FormControl(valor)) === null;

  it('DNI: 7 u 8 dígitos, con o sin puntos', () => {
    expect(valida(Validadores.dni, '30111222')).toBeTrue();
    expect(valida(Validadores.dni, '30.111.222')).toBeTrue();
    expect(valida(Validadores.dni, '1.234.567')).toBeTrue();
    expect(valida(Validadores.dni, '123456')).toBeFalse();
    expect(valida(Validadores.dni, '30-111-222')).toBeFalse();
  });

  it('teléfono: al menos 6 dígitos y solo caracteres de teléfono', () => {
    expect(valida(Validadores.telefono, '341 555-1234')).toBeTrue();
    expect(valida(Validadores.telefono, '+54 (341) 5551234')).toBeTrue();
    expect(valida(Validadores.telefono, '12345')).toBeFalse();
    expect(valida(Validadores.telefono, '341-abc-1234')).toBeFalse();
  });

  it('código postal: 4 dígitos o CPA', () => {
    expect(valida(Validadores.codigoPostal, '2000')).toBeTrue();
    expect(valida(Validadores.codigoPostal, 'S2000ABC')).toBeTrue();
    expect(valida(Validadores.codigoPostal, '200')).toBeFalse();
  });

  it('mensajes: usa el específico del campo o uno genérico', () => {
    expect(mensajeDeError({ required: true })).toBe('Este campo es obligatorio.');
    expect(mensajeDeError({ pattern: {} }, { pattern: 'DNI inválido' })).toBe('DNI inválido');
    expect(mensajeDeError({ min: { min: 0 } })).toContain('0');
  });
});
