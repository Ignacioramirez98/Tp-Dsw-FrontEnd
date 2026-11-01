import { Component, Input } from '@angular/core';

/** Estado visual de una venta (u otro registro con estado). */
@Component({
  selector: 'app-status-chip',
  standalone: true,
  template: `<span class="chip chip-{{ clave }}">{{ etiqueta }}</span>`,
  styles: `
    .chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px;
            font-size: 0.75rem; font-weight: 600; line-height: 1rem; white-space: nowrap; }
    .chip::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    .chip-pendiente { background: #FBEFD5; color: #7A4E0A; }
    .chip-concretada { background: #E3F0E5; color: #23562F; }
    .chip-facturada { background: #E3ECF8; color: #1E4E8C; }
    .chip-cancelada { background: #F8E3E0; color: #8F2D24; }
    .chip-otro { background: #ECE8DD; color: #3E4A43; }
  `,
})
export class StatusChipComponent {
  /** Estado tal como viene del backend, ej. "pendiente". */
  @Input({ required: true }) estado = '';

  private static readonly CONOCIDOS = ['pendiente', 'concretada', 'facturada', 'cancelada'];

  get clave(): string {
    const valor = this.estado.trim().toLowerCase();
    return StatusChipComponent.CONOCIDOS.includes(valor) ? valor : 'otro';
  }

  get etiqueta(): string {
    const valor = this.estado.trim();
    return valor ? valor.charAt(0).toUpperCase() + valor.slice(1) : '—';
  }
}
