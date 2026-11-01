import { Component, inject } from '@angular/core';
import { NotificacionService } from './notificacion.service';

/** Contenedor de avisos; va una sola vez en AppComponent. */
@Component({
  selector: 'app-toasts',
  standalone: true,
  template: `
    <div class="toasts" aria-live="polite" aria-atomic="false">
      @for (n of servicio.notificaciones(); track n.id) {
        <div class="aviso aviso-{{ n.tipo }}" role="status">
          <i class="bi" [class.bi-check-circle-fill]="n.tipo === 'exito'" [class.bi-exclamation-triangle-fill]="n.tipo === 'error'"
             [class.bi-info-circle-fill]="n.tipo === 'info'" aria-hidden="true"></i>
          <span class="texto">{{ n.mensaje }}</span>
          <button type="button" class="cerrar" (click)="servicio.cerrar(n.id)" aria-label="Cerrar aviso">
            <i class="bi bi-x-lg" aria-hidden="true"></i>
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .toasts { position: fixed; z-index: 2000; left: 1rem; right: 1rem; bottom: 1rem; display: flex; flex-direction: column; gap: 0.5rem; pointer-events: none; }
    @media (min-width: 768px) { .toasts { left: auto; width: 380px; } }
    .aviso { pointer-events: auto; display: flex; align-items: flex-start; gap: 0.625rem; padding: 0.875rem 1rem; border-radius: 12px;
             background: #fff; border: 1px solid #E2DED3; box-shadow: 0 8px 24px rgba(27, 36, 31, 0.15); font-size: 0.9rem; }
    .aviso i.bi:first-child { font-size: 1.1rem; margin-top: 1px; }
    .aviso-exito i.bi:first-child { color: #2E7D45; }
    .aviso-error { border-color: #E9B8B2; } .aviso-error i.bi:first-child { color: #A33A2F; }
    .aviso-info i.bi:first-child { color: #1E4E8C; }
    .texto { flex: 1; }
    .cerrar { border: 0; background: transparent; color: #5B665F; width: 28px; height: 28px; border-radius: 6px; }
    .cerrar:hover { background: #F5F3EC; }
  `,
})
export class ToastsComponent {
  readonly servicio = inject(NotificacionService);
}
