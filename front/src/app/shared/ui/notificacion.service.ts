import { Injectable, signal } from '@angular/core';

export type TipoNotificacion = 'exito' | 'error' | 'info';

export interface Notificacion {
  id: number;
  tipo: TipoNotificacion;
  mensaje: string;
}

/**
 * Avisos breves (toasts) para informar el resultado de una acción,
 * en lugar de los alert() del navegador.
 */
@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private siguienteId = 1;
  readonly notificaciones = signal<Notificacion[]>([]);

  exito(mensaje: string): void { this.mostrar('exito', mensaje); }
  error(mensaje: string): void { this.mostrar('error', mensaje, 6000); }
  info(mensaje: string): void { this.mostrar('info', mensaje); }

  cerrar(id: number): void {
    this.notificaciones.update((lista) => lista.filter((n) => n.id !== id));
  }

  private mostrar(tipo: TipoNotificacion, mensaje: string, duracionMs = 4000): void {
    const id = this.siguienteId++;
    this.notificaciones.update((lista) => [...lista, { id, tipo, mensaje }]);
    setTimeout(() => this.cerrar(id), duracionMs);
  }
}
