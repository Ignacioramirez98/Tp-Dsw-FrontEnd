import { Component, Input } from '@angular/core';

/**
 * Encabezado de pantalla: título, descripción opcional y acciones a la derecha.
 *   <app-page-header titulo="Ventas" subtitulo="...">
 *     <button acciones class="btn btn-primary">Nueva venta</button>
 *   </app-page-header>
 */
@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <header class="encabezado">
      <div class="textos">
        <h1 class="mb-0">{{ titulo }}</h1>
        @if (subtitulo) {
          <p class="mb-0 text-secondary">{{ subtitulo }}</p>
        }
      </div>
      <div class="acciones"><ng-content select="[acciones]" /></div>
    </header>
  `,
  styles: `
    .encabezado { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem; }
    .textos { display: flex; flex-direction: column; gap: 0.25rem; }
    .acciones { display: flex; flex-wrap: wrap; gap: 0.5rem; }
  `,
})
export class PageHeaderComponent {
  @Input({ required: true }) titulo = '';
  @Input() subtitulo = '';
}
