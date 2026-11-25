import { Component, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { FacturasService } from '../../factura.service';
import { Factura, FiltrosFactura } from '../../../../shared/models/factura.model';
import { ListadoBase } from '../../../../shared/ui/listado-base';
import { AuthService } from '../../../../shared/services/auth.service';

/**
 * Listado de facturas. Lo usan el personal ("Facturas") y el cliente ("Mis facturas":
 * el backend le devuelve solo las suyas). El rango de fechas de emisión lo filtra el backend.
 * Las facturas son comprobantes: no se editan ni se eliminan.
 */
@Component({
  selector: 'app-facturas-list',
  templateUrl: './facturas-list.component.html',
  standalone: false,
})
export class FacturasListComponent extends ListadoBase<Factura> {
  private readonly facturas = inject(FacturasService);
  protected readonly recurso = 'facturas';

  readonly esCliente = inject(AuthService).getRol() === 'cliente';

  filtros: FiltrosFactura = { desde: '', hasta: '' };
  errorFechas = '';

  get hayFiltros(): boolean {
    return !!(this.busqueda || this.filtros.desde || this.filtros.hasta);
  }

  /** Rango de fechas de emisión. Se valida acá para no pedir un rango invertido. */
  filtrarPorFecha(campo: 'desde' | 'hasta', valor: string): void {
    this.filtros = { ...this.filtros, [campo]: valor };
    const { desde, hasta } = this.filtros;
    this.errorFechas = desde && hasta && desde > hasta ? 'La fecha "desde" no puede ser posterior a "hasta".' : '';
    if (this.errorFechas) return;
    this.pagina = 1;
    this.recargar();
  }

  limpiarFiltros(buscador: HTMLInputElement, desde: HTMLInputElement, hasta: HTMLInputElement): void {
    buscador.value = desde.value = hasta.value = '';
    this.busqueda = '';
    this.errorFechas = '';
    this.filtros = { desde: '', hasta: '' };
    this.pagina = 1;
    this.recargar();
  }

  protected cargar$() { return this.facturas.getFacturas(this.filtros); }
  protected eliminar$(): Observable<never> { return throwError(() => new Error('Las facturas no se eliminan')); }
  protected textoBuscable(f: Factura) {
    return `${f.numero} ${f.receptor?.nombre ?? ''} ${f.receptor?.razonSocial ?? ''} ${f.receptor?.dni ?? ''}`;
  }
  protected descripcion(f: Factura) { return `la factura ${f.numero}`; }
}
