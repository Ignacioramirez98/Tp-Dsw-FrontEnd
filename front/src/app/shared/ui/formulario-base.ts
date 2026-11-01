import { Directive, ElementRef, OnInit, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificacionService } from './notificacion.service';
import { mensajeDeError } from '../utils/validadores';

/**
 * Comportamiento común de los formularios de alta y edición (patrón Template Method):
 * detectar si es edición, cargar el registro, validar, guardar y volver al listado.
 * Cada formulario concreto define sus campos y cómo crear/actualizar.
 */
@Directive()
export abstract class FormularioBase<T> implements OnInit {
  protected readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);
  protected readonly notificaciones = inject(NotificacionService);
  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);

  form!: FormGroup;
  id: string | null = null;
  cargando = false;
  guardando = false;
  errorServidor = '';

  /** Ej. "cliente"; se usa en títulos y mensajes. */
  protected abstract readonly recurso: string;
  /** 'o' para "creado", 'a' para "creada". */
  protected readonly genero: 'o' | 'a' = 'o';
  /** Ruta del listado al que se vuelve. */
  abstract readonly rutaListado: string;
  /** Mensajes de error específicos por campo y tipo, ej. { dni: { pattern: '...' } }. */
  protected readonly mensajes: Record<string, Record<string, string>> = {};

  protected abstract crearFormulario(): FormGroup;
  protected abstract obtener$(id: string): Observable<T>;
  protected abstract crear$(valor: any): Observable<unknown>;
  protected abstract actualizar$(id: string, valor: any): Observable<unknown>;

  get esEdicion(): boolean {
    return !!this.id;
  }

  get titulo(): string {
    return `${this.esEdicion ? 'Editar' : this.genero === 'a' ? 'Nueva' : 'Nuevo'} ${this.recurso}`;
  }

  ngOnInit(): void {
    this.form = this.crearFormulario();
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.cargando = true;
      this.obtener$(this.id).subscribe({
        next: (entidad) => {
          this.cargarEnFormulario(entidad);
          this.cargando = false;
        },
        error: () => {
          this.notificaciones.error(`No se encontró ${this.genero === 'a' ? 'la' : 'el'} ${this.recurso}.`);
          this.router.navigate([this.rutaListado]);
        },
      });
    }
  }

  /** Copia el registro al formulario; se puede redefinir para campos especiales. */
  protected cargarEnFormulario(entidad: T): void {
    this.form.patchValue(entidad as Record<string, unknown>);
  }

  /** Valor a enviar al backend; se puede redefinir para transformar campos. */
  protected valorParaEnviar(): Record<string, unknown> {
    return this.form.getRawValue();
  }

  /** Mensaje de error de un campo, solo si el usuario ya lo tocó. */
  error(campo: string): string | null {
    const control = this.form.get(campo);
    if (!control || !control.errors || !(control.touched || control.dirty)) return null;
    return mensajeDeError(control.errors, this.mensajes[campo]);
  }

  guardar(): void {
    if (this.guardando) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      // Llevar el foco al primer campo con error
      setTimeout(() => this.elemento.nativeElement.querySelector<HTMLElement>('.ng-invalid[formControlName]')?.focus());
      return;
    }

    this.guardando = true;
    this.errorServidor = '';
    const valor = this.valorParaEnviar();
    const pedido$ = this.id ? this.actualizar$(this.id, valor) : this.crear$(valor);

    pedido$.subscribe({
      next: () => {
        const accion = this.esEdicion ? 'actualizad' : 'cread';
        const articulo = this.genero === 'a' ? 'La' : 'El';
        this.notificaciones.exito(`${articulo} ${this.recurso} fue ${accion}${this.genero}.`);
        this.router.navigate([this.rutaListado]);
      },
      error: (err: HttpErrorResponse) => {
        this.guardando = false;
        // El backend explica qué falló (ej. "Validación fallida: dni debe tener 7 u 8 dígitos")
        this.errorServidor = err.status === 0
          ? 'No se pudo conectar con el servidor.'
          : err.error?.message ?? 'No se pudo guardar. Revisá los datos e intentá de nuevo.';
      },
    });
  }

  cancelar(): void {
    this.router.navigate([this.rutaListado]);
  }
}
