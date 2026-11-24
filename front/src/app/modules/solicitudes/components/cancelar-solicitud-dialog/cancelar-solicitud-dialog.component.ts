import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface DatosCancelarSolicitud {
  /** Nombre del servicio, para el texto del diálogo. */
  servicio: string;
}

export interface ResultadoCancelarSolicitud {
  motivo?: string;
}

/** El personal cancela una solicitud y puede dejar el motivo (opcional). */
@Component({
  selector: 'app-cancelar-solicitud-dialog',
  standalone: true,
  imports: [FormsModule],
  template: `
    <form class="p-4" (ngSubmit)="confirmar()" novalidate>
      <h2 id="cancelar-solicitud-titulo" class="h5 mb-1">Cancelar solicitud</h2>
      <p class="text-secondary mb-3">{{ datos.servicio }}. No se puede deshacer.</p>

      <div class="mb-4">
        <label class="form-label fw-semibold" for="cancelar-motivo">Motivo <span class="text-secondary fw-normal">(opcional)</span></label>
        <textarea id="cancelar-motivo" class="form-control" rows="3" name="motivo" [(ngModel)]="motivo" maxlength="300"
                  placeholder="Ej. El cliente pidió reprogramar"></textarea>
        <div class="form-text">Lo ve el cliente en el detalle de su solicitud.</div>
      </div>

      <div class="d-flex justify-content-end gap-2 flex-wrap">
        <button type="button" class="btn btn-outline-secondary" (click)="ref.close()">Volver</button>
        <button type="submit" class="btn btn-danger">Cancelar solicitud</button>
      </div>
    </form>
  `,
})
export class CancelarSolicitudDialogComponent {
  readonly datos = inject<DatosCancelarSolicitud>(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef<CancelarSolicitudDialogComponent, ResultadoCancelarSolicitud>);

  motivo = '';

  confirmar(): void {
    const motivo = this.motivo.trim();
    this.ref.close(motivo ? { motivo } : {});
  }
}
