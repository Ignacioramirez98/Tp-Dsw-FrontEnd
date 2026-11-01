import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClientesService } from '../../cliente.service';
import { VentasService } from '../../../ventas/ventas.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { Cliente } from '../../../../shared/models/cliente.model';
import { Venta } from '../../../../shared/models/venta.model';
import { ordenarPorFecha } from '../../../../shared/utils/venta';

/** Ficha del cliente con su localidad y su historial de ventas. */
@Component({
  selector: 'app-cliente-detail',
  templateUrl: './cliente-detail.component.html',
  standalone: false,
})
export class ClienteDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly clientes = inject(ClientesService);
  private readonly ventasService = inject(VentasService);
  private readonly rol = inject(AuthService).getRol();

  readonly puedeEditar = this.rol === 'admin' || this.rol === 'vendedor';
  // Las ventas solo las ve el personal comercial (igual que en el backend)
  readonly veVentas = this.puedeEditar;

  cliente: Cliente | null = null;
  ventas: Venta[] = [];
  cargando = true;
  cargandoVentas = false;
  error = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.clientes.getCliente(id).subscribe({
      next: ({ data }) => {
        this.cliente = data;
        this.cargando = false;
      },
      error: (err) => {
        this.error = err.status === 404 ? 'El cliente no existe o fue eliminado.' : 'No se pudo cargar el cliente.';
        this.cargando = false;
      },
    });

    if (this.veVentas) {
      this.cargandoVentas = true;
      this.ventasService.getVentas({ clienteId: id }).subscribe({
        next: ({ data }) => {
          this.ventas = ordenarPorFecha(data);
          this.cargandoVentas = false;
        },
        error: () => (this.cargandoVentas = false),
      });
    }
  }
}
