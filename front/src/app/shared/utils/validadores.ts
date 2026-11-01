import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

/**
 * Validadores del front, con las mismas reglas que los schemas Zod del backend,
 * para avisar el error antes de enviar el formulario.
 */
export const Validadores = {
  /** DNI de 7 u 8 dígitos; acepta puntos (30.111.222). */
  dni: Validators.pattern(/^\d{1,2}\.?\d{3}\.?\d{3}$/),

  /** Código postal de 4 dígitos (2000) o CPA (S2000ABC). */
  codigoPostal: Validators.pattern(/^([A-Za-z]\d{4}[A-Za-z]{3}|\d{4})$/),

  /** Entero mayor o igual a 0. */
  entero: Validators.pattern(/^\d+$/),

  /** Teléfono: dígitos, espacios, +, - y paréntesis, con al menos 6 dígitos. */
  telefono: ((control: AbstractControl): ValidationErrors | null => {
    const valor = String(control.value ?? '').trim();
    if (!valor) return null;
    const valido = /^[\d\s+()-]+$/.test(valor) && valor.replace(/\D/g, '').length >= 6;
    return valido ? null : { telefono: true };
  }) as ValidatorFn,
};

/** Texto del error de un campo (el primero que aplique). */
export function mensajeDeError(errores: ValidationErrors, mensajes: Record<string, string> = {}): string {
  const [tipo, detalle] = Object.entries(errores)[0];
  if (mensajes[tipo]) return mensajes[tipo];
  switch (tipo) {
    case 'required': return 'Este campo es obligatorio.';
    case 'email': return 'Ingresá un mail válido (ej. nombre@dominio.com).';
    case 'min': return `Tiene que ser mayor o igual a ${detalle.min}.`;
    case 'max': return `Tiene que ser menor o igual a ${detalle.max}.`;
    case 'maxlength': return `Máximo ${detalle.requiredLength} caracteres.`;
    case 'minlength': return `Mínimo ${detalle.requiredLength} caracteres.`;
    case 'telefono': return 'Ingresá un teléfono válido (al menos 6 dígitos).';
    default: return 'El valor ingresado no es válido.';
  }
}

/** Campos comunes de las personas (cliente, vendedor, operario), con las reglas del backend. */
export function camposPersona() {
  return {
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    apellido: ['', [Validators.required, Validators.maxLength(100)]],
    dni: ['', [Validators.required, Validadores.dni]],
    mail: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validadores.telefono]],
  };
}

/** Mensajes de error de los campos de persona. */
export const MENSAJES_PERSONA: Record<string, Record<string, string>> = {
  dni: { pattern: 'El DNI tiene que tener 7 u 8 dígitos (ej. 30.111.222).' },
};
