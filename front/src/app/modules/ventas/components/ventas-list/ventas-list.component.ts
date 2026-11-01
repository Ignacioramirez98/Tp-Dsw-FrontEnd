import { Component, inject } from '@angular/core';
import { VentasService } from '../../ventas.service';
import { EstadoVenta, FiltrosVenta, Venta } from '../../../../shared/models/venta.model';
import { ListadoBase } from '../../../../shared/ui/listado-base';
import { AuthService } from '../../../../shared/services/auth.service';
import { totalVenta } from '../../../../shared/utils/venta';

/**
 * Listado de ventas. Lo usan el personal ("Ventas") y el cliente ("Mis compras":
 * el backend le devuelve solo las suyas). Estado y rango de fechas los filtra el backend.
 */
@Component({
  selector: 'app-ventas-list',
  templateUrl: './ventas-list.component.html',
  standalone: false,
})
export class VentasListComponent extends ListadoBase<Venta> {
  private readonly ventas = inject(VentasService);
  private readonly rol = inject(AuthService).getRol();
  protected readonly recurso = 'ventas';

  readonly esCliente = this.rol === 'cliente';
  readonly puedeCrear = this.rol === 'admin' || this.rol === 'vendedor';
  readonly puedeEliminar = this.rol === 'admin';
  readonly total = totalVenta;

  readonly opcionesEstado: { valor: EstadoVenta | ''; etiqueta: string }[] = [
    { valor: '', etiqueta: 'Todas' },
    { valor: 'pendiente', etiqueta: 'Pendientes' },
    { valor: 'concretada', etiqueta: 'Concretadas' },
    { valor: 'facturada', etiqueta: 'Facturadas' },
    { valor: 'cancelada', etiqueta: 'Canceladas' },
  ];

  filtros: FiltrosVenta = { estado: '', desde: '', hasta: '' };
  errorFechas = '';

  get hayFiltros(): boolean {
    return !!(this.busqueda || this.filtros.estado || this.filtros.desde || this.filtros.hasta);
  }

  filtrarPorEstado(estado: string): void {
    this.filtros = { ...this.filtros, estado };
    this.pagina = 1;
    this.recargar();
  }

  /** Rango de fechas del pedido. Se valida acá para no pedir un rango invertido. */
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
    this.filtros = { estado: '', desde: '', hasta: '' };
    this.pagina = 1;
    this.recargar();
  }

  /** Solo se pueden borrar pedidos pendientes o ventas canceladas (las demás movieron stock). */
  sePuedeEliminar(v: Venta): boolean {
    return this.puedeEliminar && (v.estado === 'pendiente' || v.estado === 'cancelada');
  }

  nombreCliente(v: Venta): string {
    return v.cliente ? `${v.cliente.nombre} ${v.cliente.apellido}` : 'Cliente eliminado';
  }

  protected cargar$() { return this.ventas.getVentas(this.filtros); }
  protected eliminar$(id: string) { return this.ventas.deleteVenta(id); }
  protected textoBuscable(v: Venta) {
    const productos = (v.items ?? []).map((i) => i.producto?.nombre).join(' ');
    return `${this.nombreCliente(v)} ${v.cliente?.razon_social ?? ''} ${v.vendedor?.nombre ?? ''} ${v.vendedor?.apellido ?? ''} ${productos}`;
  }
  protected descripcion(v: Venta) { return `la venta de ${this.nombreCliente(v)}`; }
}
