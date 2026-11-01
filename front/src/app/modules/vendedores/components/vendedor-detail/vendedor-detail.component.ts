import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VendedoresService } from '../../vendedor.service';
import { VentasService } from '../../../ventas/ventas.service';
import { Vendedor } from '../../../../shared/models/vendedor.model';
import { Venta } from '../../../../shared/models/venta.model';
import { ordenarPorFecha, totalVenta } from '../../../../shared/utils/venta';

/** Vendedor con las ventas que concretó y lo que facturó. */
@Component({
  selector: 'app-vendedor-detail',
  templateUrl: './vendedor-detail.component.html',
  standalone: false,
})
export class VendedorDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly vendedores = inject(VendedoresService);
  private readonly ventasService = inject(VentasService);

  vendedor: Vendedor | null = null;
  ventas: Venta[] = [];
  cargando = true;
  cargandoVentas = true;
  error = '';

  /** Suma de las ventas que no fueron canceladas. */
  get totalVendido(): number {
    return this.ventas.filter((v) => v.estado !== 'cancelada').reduce((total, v) => total + totalVenta(v), 0);
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.vendedores.getVendedor(id).subscribe({
      next: ({ data }) => {
        this.vendedor = data;
        this.cargando = false;
      },
      error: (err) => {
        this.error = err.status === 404 ? 'El vendedor no existe o fue eliminado.' : 'No se pudo cargar el vendedor.';
        this.cargando = false;
      },
    });
    this.ventasService.getVentas({ vendedorId: id }).subscribe({
      next: ({ data }) => {
        this.ventas = ordenarPorFecha(data);
        this.cargandoVentas = false;
      },
      error: () => (this.cargandoVentas = false),
    });
  }
}
