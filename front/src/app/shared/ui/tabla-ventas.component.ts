import { Component, Input } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Venta } from '../models/venta.model';
import { StatusChipComponent } from './status-chip.component';
import { totalVenta } from '../utils/venta';

/**
 * Listado compacto de ventas, usado en los detalles de cliente y vendedor.
 *   <app-tabla-ventas [ventas]="ventas" columna="vendedor" />
 */
@Component({
  selector: 'app-tabla-ventas',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, RouterLink, StatusChipComponent],
  template: `
    @if (ventas.length === 0) {
      <div class="estado-panel"><i class="bi bi-receipt" aria-hidden="true"></i>{{ vacio }}</div>
    } @else {
      <table class="table tabla-adaptable">
        <thead>
          <tr>
            <th scope="col">Fecha</th>
            <th scope="col">{{ columna === 'cliente' ? 'Cliente' : 'Vendedor' }}</th>
            <th scope="col">Estado</th>
            <th scope="col" class="text-md-end">Total</th>
            <th scope="col"><span class="solo-lectores">Acciones</span></th>
          </tr>
        </thead>
        <tbody>
          @for (v of ventas; track v._id) {
            <tr>
              <td class="celda-principal"><strong>{{ v.fechaContacto | date: 'dd/MM/yyyy' }}</strong></td>
              @if (columna === 'cliente') {
                <td data-label="Cliente">{{ v.cliente ? v.cliente.nombre + ' ' + v.cliente.apellido : '—' }}</td>
              } @else {
                <td data-label="Vendedor">{{ v.vendedor ? v.vendedor.nombre + ' ' + v.vendedor.apellido : 'Sin asignar' }}</td>
              }
              <td data-label="Estado"><app-status-chip [estado]="v.estado" /></td>
              <td data-label="Total" class="text-md-end fw-semibold">{{ total(v) | currency: 'ARS' : '$' : '1.0-0' : 'es-AR' }}</td>
              <td class="celda-acciones">
                <a [routerLink]="['/ventas', v._id]" class="btn btn-sm btn-outline-secondary" [attr.aria-label]="'Ver venta del ' + (v.fechaContacto | date: 'dd/MM/yyyy')">
                  <i class="bi bi-eye" aria-hidden="true"></i> Ver
                </a>
              </td>
            </tr>
          }
        </tbody>
      </table>
    }
  `,
})
export class TablaVentasComponent {
  @Input({ required: true }) ventas: Venta[] = [];
  /** Qué persona mostrar en cada fila: la contraparte de la ficha. */
  @Input() columna: 'cliente' | 'vendedor' = 'cliente';
  @Input() vacio = 'Todavía no hay ventas.';

  readonly total = totalVenta;
}
