import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Operario } from '../../../../shared/models/operario.model';

export interface DatosAceptar {
  operarios: Operario[];
}

export interface ResultadoAceptar {
  operarioId: string;
}

/**
 * Solo para el admin cuando la solicitud no tiene responsable: elige qué operario se hace cargo.
 * Un operario acepta siempre a su nombre y no pasa por acá.
 */
@Component({
  selector: 'app-aceptar-solicitud-dialog',
  standalone: true,
  imports: [FormsModule],
  template: `
    <form class="p-4" (ngSubmit)="confirmar()" novalidate>
      <h2 id="aceptar-titulo" class="h5 mb-1">Aceptar solicitud</h2>
      <p class="text-secondary mb-3">El servicio no tiene un operario asignado: elegí quién se hace cargo.</p>

      <div class="mb-4">
        <label class="form-label fw-semibold" for="aceptar-operario">Operario</label>
        <select id="aceptar-operario" class="form-select" name="operarioId" [(ngModel)]="operarioId"
                [class.is-invalid]="intentado && !operarioId"
                [attr.aria-describedby]="intentado && !operarioId ? 'aceptar-operario-error' : null">
          <option value="">Elegí un operario</option>
          @for (o of datos.operarios; track o._id) {
            <option [value]="o._id">{{ o.nombre }} {{ o.apellido }}</option>
          }
        </select>
        @if (intentado && !operarioId) {
          <div id="aceptar-operario-error" class="invalid-feedback d-block">Elegí el operario que se hace cargo.</div>
        }
      </div>

      <div class="d-flex justify-content-end gap-2 flex-wrap">
        <button type="button" class="btn btn-outline-secondary" (click)="ref.close()">Volver</button>
        <button type="submit" class="btn btn-primary"><i class="bi bi-check-lg" aria-hidden="true"></i> Aceptar solicitud</button>
      </div>
    </form>
  `,
})
export class AceptarSolicitudDialogComponent {
  readonly datos = inject<DatosAceptar>(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef<AceptarSolicitudDialogComponent, ResultadoAceptar>);

  operarioId = '';
  intentado = false;

  confirmar(): void {
    this.intentado = true;
    if (!this.operarioId) return;
    this.ref.close({ operarioId: this.operarioId });
  }
}
