import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SolicitudServicio } from '../../../../shared/models/solicitud-servicio.model';
import { importeDeHoras } from '../../../../shared/utils/solicitud';

export interface DatosFinalizar {
  solicitud: SolicitudServicio;
}

export interface ResultadoFinalizar {
  horasReales: number;
}

/** Paso de confirmación para finalizar el trabajo: pide las horas reales y muestra el importe final. */
@Component({
  selector: 'app-finalizar-solicitud-dialog',
  standalone: true,
  imports: [CurrencyPipe, FormsModule],
  template: `
    <form class="p-4" (ngSubmit)="confirmar()" novalidate>
      <h2 id="finalizar-titulo" class="h5 mb-1">Finalizar trabajo</h2>
      <p class="text-secondary mb-3">
        {{ datos.solicitud.servicio?.descripcion ?? 'Servicio' }} · estimadas {{ datos.solicitud.horasEstimadas }} h
      </p>

      <div class="mb-3">
        <label class="form-label fw-semibold" for="finalizar-horas">Horas reales trabajadas</label>
        <input id="finalizar-horas" type="number" class="form-control" name="horasReales" [(ngModel)]="horasReales"
               min="0.5" max="1000" step="0.5" inputmode="decimal"
               [class.is-invalid]="intentado && !horasValidas"
               [attr.aria-describedby]="intentado && !horasValidas ? 'finalizar-horas-error' : null">
        @if (intentado && !horasValidas) {
          <div id="finalizar-horas-error" class="invalid-feedback d-block">Ingresá las horas trabajadas (entre 0,5 y 1000).</div>
        }
      </div>

      <div class="d-flex justify-content-between align-items-baseline border-top pt-3 mb-4">
        <span class="text-secondary">Importe final ({{ datos.solicitud.importePorHora | currency: 'ARS' : '$' : '1.0-0' : 'es-AR' }}/h)</span>
        <strong aria-live="polite">{{ importeFinal | currency: 'ARS' : '$' : '1.0-0' : 'es-AR' }}</strong>
      </div>

      <div class="d-flex justify-content-end gap-2 flex-wrap">
        <button type="button" class="btn btn-outline-secondary" (click)="ref.close()">Volver</button>
        <button type="submit" class="btn btn-primary"><i class="bi bi-check-lg" aria-hidden="true"></i> Finalizar trabajo</button>
      </div>
    </form>
  `,
})
export class FinalizarSolicitudDialogComponent {
  readonly datos = inject<DatosFinalizar>(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef<FinalizarSolicitudDialogComponent, ResultadoFinalizar>);

  /** Se propone lo estimado: si coincide con lo trabajado, alcanza con confirmar. */
  horasReales: number | null = this.datos.solicitud.horasEstimadas;
  intentado = false;

  get horasValidas(): boolean {
    const h = Number(this.horasReales);
    return Number.isFinite(h) && h >= 0.5 && h <= 1000;
  }

  get importeFinal(): number {
    return this.horasValidas ? importeDeHoras(this.horasReales, this.datos.solicitud.importePorHora) : 0;
  }

  confirmar(): void {
    this.intentado = true;
    if (!this.horasValidas) return;
    this.ref.close({ horasReales: Number(this.horasReales) });
  }
}
