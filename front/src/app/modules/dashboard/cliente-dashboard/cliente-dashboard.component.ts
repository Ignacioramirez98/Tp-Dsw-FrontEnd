import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../../shared/services/auth.service';
import { Venta } from '../../../shared/models/venta.model';
import { ordenarPorFecha, totalVenta } from '../../../shared/utils/venta';
import { CarritoService } from '../../../shared/services/carrito.service';
import { VentasService } from '../../ventas/ventas.service';

/** Inicio del cliente: accesos al catálogo y servicios, y sus últimos pedidos. */
@Component({
  selector: 'app-cliente-dashboard',
  templateUrl: './cliente-dashboard.component.html',
  standalone: false,
})
export class ClienteDashboardComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly ventas = inject(VentasService);
  readonly carrito = inject(CarritoService);

  readonly usuario = this.auth.getDecodedTokenPayload()?.['usuario'] ?? '';
  readonly total = totalVenta;

  recientes: Venta[] = [];
  cargando = true;
  error = '';

  ngOnInit(): void {
    this.cargar();
  }

  /** El back devuelve solo las ventas del cliente que inició sesión. También lo usa Reintentar. */
  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.ventas.getVentas().subscribe({
      next: ({ data }) => {
        this.recientes = ordenarPorFecha(data).slice(0, 3);
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar tus pedidos.';
        this.cargando = false;
      },
    });
  }

  /** Cantidad de unidades pedidas en una venta. */
  unidades(venta: Venta): number {
    return (venta.items ?? []).reduce((suma, item) => suma + item.cantidad, 0);
  }
}
