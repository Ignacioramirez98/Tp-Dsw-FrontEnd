import { Component, Input } from '@angular/core';

/**
 * Envuelve un control de formulario con su etiqueta, ayuda y mensaje de error.
 *   <app-campo etiqueta="Nombre" para="nombre" [error]="error('nombre')">
 *     <input id="nombre" class="form-control" formControlName="nombre">
 *   </app-campo>
 */
@Component({
  selector: 'app-campo',
  standalone: true,
  template: `
    <div class="mb-3">
      <label class="form-label fw-semibold" [attr.for]="para">
        {{ etiqueta }}@if (opcional) {<span class="text-secondary fw-normal"> (opcional)</span>}
      </label>
      <ng-content />
      @if (error) {
        <div class="invalid-feedback d-block" [id]="para + '-error'">{{ error }}</div>
      } @else if (ayuda) {
        <div class="form-text">{{ ayuda }}</div>
      }
    </div>
  `,
})
export class CampoComponent {
  @Input({ required: true }) etiqueta = '';
  /** id del control, para asociar la etiqueta. */
  @Input({ required: true }) para = '';
  @Input() error: string | null = null;
  @Input() ayuda = '';
  @Input() opcional = false;
}
