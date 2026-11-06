import { Component, OnInit, inject } from '@angular/core';
import { formatDate } from '@angular/common';
import { AuthService } from '../../../shared/services/auth.service';
import { MENU_PERSONAL, Rol } from '../../../shared/auth/roles';
import { Producto } from '../../../shared/models/producto.model';
import { Servicio } from '../../../shared/models/servicio.model';
import { Venta } from '../../../shared/models/venta.model';
import { ResumenVentas, resumirVentas } from '../../../shared/utils/venta';
import { VentasService } from '../../ventas/ventas.service';
import { ProductosService } from '../../productos/producto.service';
import { ServiciosService } from '../../servicios/servicio.service';

/** Panel de inicio del personal (admin, vendedor y operario). Cada rol ve sus propios indicadores. */
@Component({
  selector: 'app-vendedor-dashboard',
  templateUrl: './vendedor-dashboard.component.html',
  standalone: false,
})
export class VendedorDashboardComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly ventas = inject(VentasService);
  private readonly productos = inject(ProductosService);
  private readonly servicios = inject(ServiciosService);

  /** Cuántos pedidos pendientes se muestran en el panel (el resto está en Ventas). */
  private static readonly PEDIDOS_VISIBLES = 5;
  /** Se considera stock bajo a partir de esta cantidad hacia abajo. */
  private static readonly UMBRAL_STOCK_BAJO = 2;

  readonly rol = this.auth.getRol() ?? '';
  readonly usuario = this.auth.getDecodedTokenPayload()?.['usuario'] ?? '';
  readonly hoy = new Date();
  readonly fecha = formatDate(this.hoy, "EEEE d 'de' MMMM", 'es-AR');
  readonly veVentas = this.rol === 'admin' || this.rol === 'vendedor';
  readonly accesos = MENU_PERSONAL.filter((i) => i.roles.includes(this.rol as Rol) && i.ruta !== '/vendedor-dashboard');

  resumen: ResumenVentas | null = null;
  /** Primeros pedidos pendientes; se calcula una sola vez para no recrear el array en cada ciclo de la vista. */
  pedidosParaConcretar: Venta[] = [];
  stockBajo: Producto[] = [];
  misServicios: Servicio[] = [];
  cargando = true;
  error = '';

  ngOnInit(): void {
    this.cargar();
  }

  /** Trae los datos que necesita el rol. También lo usa el botón Reintentar. */
  cargar(): void {
    this.cargando = true;
    this.error = '';

    if (this.veVentas) {
      const vendedorId = this.rol === 'vendedor' ? this.auth.getVendedorId() : null;
      this.ventas.getVentas().subscribe({
        next: ({ data }) => {
          this.resumen = resumirVentas(data, this.hoy, vendedorId);
          this.pedidosParaConcretar = this.resumen.pendientes.slice(0, VendedorDashboardComponent.PEDIDOS_VISIBLES);
          this.cargando = false;
        },
        error: () => {
          this.error = 'No se pudieron cargar las ventas.';
          this.cargando = false;
        },
      });
    }

    if (this.rol === 'admin') {
      this.productos.getProductos().subscribe({
        next: ({ data }) => {
          this.stockBajo = data
            .filter((p) => p.stock <= VendedorDashboardComponent.UMBRAL_STOCK_BAJO)
            .sort((a, b) => a.stock - b.stock);
        },
        error: () => {
          this.error ||= 'No se pudo cargar el stock de los productos.';
        },
      });
    }

    if (this.rol === 'operario') {
      this.servicios.getServicios({ operarioId: this.auth.getOperarioId() ?? '' }).subscribe({
        next: ({ data }) => {
          this.misServicios = data;
          this.cargando = false;
        },
        error: () => {
          this.error = 'No se pudieron cargar tus servicios.';
          this.cargando = false;
        },
      });
    }
  }
}
