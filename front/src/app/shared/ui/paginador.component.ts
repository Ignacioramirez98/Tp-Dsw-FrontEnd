import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Paginación reutilizable.
 * Recibe la página actual y el total (@Input) y avisa al padre cuando el usuario cambia de página (@Output).
 *   <app-paginador [pagina]="pagina" [totalPaginas]="total" (cambioPagina)="irA($event)" />
 */
@Component({
  selector: 'app-paginador',
  standalone: true,
  template: `
    @if (totalPaginas > 1) {
      <nav class="paginador" aria-label="Paginación">
        <button type="button" class="btn btn-outline-secondary btn-sm" [disabled]="pagina <= 1"
                (click)="ir(pagina - 1)" aria-label="Página anterior">
          <i class="bi bi-chevron-left" aria-hidden="true"></i>
        </button>
        <span class="estado">Página {{ pagina }} de {{ totalPaginas }}</span>
        <button type="button" class="btn btn-outline-secondary btn-sm" [disabled]="pagina >= totalPaginas"
                (click)="ir(pagina + 1)" aria-label="Página siguiente">
          <i class="bi bi-chevron-right" aria-hidden="true"></i>
        </button>
      </nav>
    }
  `,
  styles: `
    .paginador { display: flex; align-items: center; justify-content: center; gap: 0.75rem; margin-top: 1rem; }
    .estado { font-size: 0.875rem; color: var(--pa-muted); }
  `,
})
export class PaginadorComponent {
  @Input() pagina = 1;
  @Input() totalPaginas = 1;
  @Output() cambioPagina = new EventEmitter<number>();

  ir(nueva: number): void {
    if (nueva >= 1 && nueva <= this.totalPaginas && nueva !== this.pagina) {
      this.cambioPagina.emit(nueva);
    }
  }
}
