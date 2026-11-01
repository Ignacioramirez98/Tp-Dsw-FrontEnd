import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Venta } from '../../../../shared/models/venta.model';
import { Vendedor } from '../../../../shared/models/vendedor.model';
import { totalVenta } from '../../../../shared/utils/venta';

export interface DatosConcretar {
  venta: Venta;
  /** Solo para el admin: elige qué vendedor concreta. Un vendedor concreta a su nombre. */
  vendedores?: Vendedor[];
}

export interface ResultadoConcretar {
  vendedorId?: string;
  fechaEntrega?: string | null;
}

/**
 * Paso de confirmación del CUU Concretar Venta: muestra el stock disponible de cada
 * producto, pide la fecha de entrega (opcional) y, si es admin, el vendedor.
 */
@Component({
  selector: 'app-concretar-venta-dialog',
  standalone: true,
  imports: [CurrencyPipe, FormsModule],
  template: `
    <form class="p-4" (ngSubmit)="confirmar()" novalidate>
      <h2 id="concretar-titulo" class="h5 mb-1">Concretar venta</h2>
      <p class="text-secondary mb-3">Se descuenta el stock de cada producto y la venta queda confirmada.</p>

      @if (renglones.length) {
        <ul class="list-unstyled mb-3 d-flex flex-column gap-2" aria-label="Stock de los productos">
          @for (r of renglones; track r.nombre) {
            <li class="d-flex justify-content-between gap-3 small">
              <span><strong class="fw-semibold">{{ r.nombre }}</strong><br>
                <span class="text-secondary">Pedido {{ r.cantidad }} · disponible {{ r.stock }}</span></span>
              @if (r.cantidad > r.stock) {
                <span class="text-danger fw-semibold text-nowrap"><i class="bi bi-exclamation-triangle" aria-hidden="true"></i> Sin stock</span>
              } @else {
                <span class="text-success fw-semibold text-nowrap"><i class="bi bi-check-lg" aria-hidden="true"></i> Quedan {{ r.stock - r.cantidad }}</span>
              }
            </li>
          }
        </ul>
        <div class="d-flex justify-content-between border-top pt-2 mb-3">
          <span class="text-secondary">Total</span><strong>{{ total | currency: 'ARS' : '$' : '1.0-0' : 'es-AR' }}</strong>
        </div>
      }

      @if (faltaStock) {
        <div class="alert alert-warning small" role="alert">
          No hay stock suficiente para concretarla. Actualizá el stock del producto o editá el pedido.
        </div>
      }

      @if (datos.vendedores) {
        <div class="mb-3">
          <label class="form-label fw-semibold" for="concretar-vendedor">Vendedor</label>
          <select id="concretar-vendedor" class="form-select" name="vendedorId" [(ngModel)]="vendedorId"
                  [class.is-invalid]="intentado && !vendedorId" [attr.aria-describedby]="intentado && !vendedorId ? 'vendedor-error' : null">
            <option value="">Elegí un vendedor</option>
            @for (v of datos.vendedores; track v._id) {
              <option [value]="v._id">{{ v.nombre }} {{ v.apellido }}</option>
            }
          </select>
          @if (intentado && !vendedorId) {
            <div id="vendedor-error" class="invalid-feedback d-block">Elegí quién concreta la venta.</div>
          }
        </div>
      } @else {
        <p class="small text-secondary">La venta queda a tu nombre.</p>
      }

      <div class="mb-4">
        <label class="form-label fw-semibold" for="concretar-entrega">Fecha de entrega <span class="text-secondary fw-normal">(opcional)</span></label>
        <input id="concretar-entrega" type="date" class="form-control" name="fechaEntrega" [min]="hoy" [(ngModel)]="fechaEntrega"
               [class.is-invalid]="entregaInvalida" [attr.aria-describedby]="entregaInvalida ? 'entrega-error' : null">
        @if (entregaInvalida) {
          <div id="entrega-error" class="invalid-feedback d-block">La entrega no puede ser antes de hoy.</div>
        }
      </div>

      <div class="d-flex justify-content-end gap-2 flex-wrap">
        <button type="button" class="btn btn-outline-secondary" (click)="ref.close()">Volver</button>
        <button type="submit" class="btn btn-primary" [disabled]="faltaStock">
          <i class="bi bi-check-lg" aria-hidden="true"></i> Concretar venta
        </button>
      </div>
    </form>
  `,
})
export class ConcretarVentaDialogComponent {
  readonly datos = inject<DatosConcretar>(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef<ConcretarVentaDialogComponent, ResultadoConcretar>);

  readonly hoy = fechaLocal(new Date());
  readonly total = totalVenta(this.datos.venta);
  vendedorId = this.datos.venta.vendedor?._id ?? '';
  fechaEntrega = '';
  intentado = false;

  /** Cantidad pedida por producto (sumando renglones repetidos) contra su stock. */
  readonly renglones = Object.values(
    (this.datos.venta.items ?? []).reduce<Record<string, { nombre: string; cantidad: number; stock: number }>>((acc, item) => {
      const p = item.producto;
      const clave = p?._id ?? 'eliminado';
      acc[clave] ??= { nombre: p?.nombre ?? 'Producto eliminado', cantidad: 0, stock: p?.stock ?? 0 };
      acc[clave].cantidad += item.cantidad;
      return acc;
    }, {}),
  );
  readonly faltaStock = this.renglones.some((r) => r.cantidad > r.stock);

  get entregaInvalida(): boolean {
    return !!this.fechaEntrega && this.fechaEntrega < this.hoy;
  }

  confirmar(): void {
    this.intentado = true;
    if (this.faltaStock || this.entregaInvalida || (this.datos.vendedores && !this.vendedorId)) return;
    this.ref.close({
      ...(this.datos.vendedores && { vendedorId: this.vendedorId }),
      ...(this.fechaEntrega && { fechaEntrega: this.fechaEntrega }),
    });
  }
}

/** AAAA-MM-DD en la hora local del navegador. */
function fechaLocal(fecha: Date): string {
  const d = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 10);
}
